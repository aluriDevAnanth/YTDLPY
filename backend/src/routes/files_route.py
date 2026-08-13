import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import StreamingResponse
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.bundle_manager import BundleManager
from src.crypto import decode_access_token
from src.db import get_session
from src.models import User, Video
from src.routes.auth_route import get_current_user, oauth2_scheme

router = APIRouter(prefix="/api", tags=["Files Streaming"])
MEDIA_TYPES = {
    "video": "video/mp4",
    "thumbnail": "image/jpeg",
    "vtt": "text/vtt",
    "vtt_sprite": "image/jpeg",
    "log": "application/x-ndjson",
}


async def authenticate_file_access(request: Request, session: AsyncSession) -> User:
    """Helper to authenticate JWT token from Bearer header or URL query param."""
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        token = request.query_params.get("token")
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    result = await session.exec(select(User).where(User.id == user_id))
    return result.first()


@router.get("/files/{file_id}")
async def stream_file(
    file_id: str, request: Request, session: AsyncSession = Depends(get_session)
):
    clean_file_id = file_id.rsplit(".", 1)[0] if "." in file_id else file_id
    video_id = None
    asset_key = None
    sprite_chunk_match = re.search(
        r"^(.*?)(_(vtt_sprite_\d+|vtt_sprite|thumbnail|video|vtt|log))$", clean_file_id
    )
    if sprite_chunk_match:
        video_id = sprite_chunk_match.group(1)
        asset_key = sprite_chunk_match.group(3)
    else:
        parts = clean_file_id.rsplit("_", 1)
        if len(parts) == 2:
            video_id, asset_key = parts[0], parts[1]
        else:
            raise HTTPException(status_code=400, detail="Invalid file ID format")
    result = await session.exec(select(Video).where(Video.id == video_id))
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="File not found")
    auth_user = await authenticate_file_access(request, session)
    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required to access media files",
        )
    if auth_user.id != video.userId and auth_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied to this file")
    target_bundle_id = video.bundleId if video.bundleId else video_id
    bundle_path = BundleManager.get_bundle_path(target_bundle_id)
    if not bundle_path.exists():
        raise HTTPException(status_code=404, detail="Bundle file missing")
    try:
        index_table, payload_start = BundleManager.read_index(bundle_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read bundle: {e}")
    if asset_key not in index_table:
        raise HTTPException(
            status_code=404, detail=f"Asset '{asset_key}' not found in bundle"
        )
    asset_info = index_table[asset_key]
    file_size = asset_info["length"]
    media_type = MEDIA_TYPES.get(
        asset_key, "image/jpeg" if "sprite" in asset_key else "application/octet-stream"
    )
    range_header = request.headers.get("range")
    if range_header:
        range_match = re.search(r"bytes=(\d+)-(\d+)?", range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            if start >= file_size:
                raise HTTPException(
                    status_code=416, detail="Requested Range Not Satisfiable"
                )
            end = min(end, file_size - 1)
            content_length = end - start + 1
            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": media_type,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
            stream = BundleManager.get_asset_stream(
                target_bundle_id, asset_key, start_byte=start, end_byte=end
            )
            return StreamingResponse(
                stream, status_code=206, headers=headers, media_type=media_type
            )
    if asset_key == "vtt":
        token_val = request.query_params.get("token") or ""
        raw_vtt_chunks = []
        async for chunk in BundleManager.get_asset_stream(target_bundle_id, asset_key):
            raw_vtt_chunks.append(chunk)
        vtt_content = b"".join(raw_vtt_chunks).decode("utf-8", errors="replace")
        if token_val:
            vtt_content = re.sub(
                r"(_vtt_sprite_\d+\.jpg)",
                rf"\1?token={token_val}",
                vtt_content,
            )
        vtt_bytes = vtt_content.encode("utf-8")
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(len(vtt_bytes)),
            "Content-Type": "text/vtt",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
        return Response(content=vtt_bytes, status_code=200, headers=headers, media_type="text/vtt")

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": media_type,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
    }
    stream = BundleManager.get_asset_stream(target_bundle_id, asset_key)
    return StreamingResponse(
        stream, status_code=200, headers=headers, media_type=media_type
    )
