"""Admin system statistics, storage aggregation and system-wide video management."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.bundle_manager import BundleManager
from src.config import BUNDLES_DIR, TEMP_DIR
from src.db import get_session
from src.downloader import download_registry
from src.models import User, Video
from src.routes.admin.dependencies import require_admin
from src.sio import send_admin_event, send_remove_video
from src.utils.formatters import format_size

router = APIRouter()


@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(require_admin), session: AsyncSession = Depends(get_session)
):
    """Returns system-wide counts and disk space footprint."""
    users_count = (await session.exec(select(func.count(User.id)))).one()
    videos_count = (await session.exec(select(func.count(Video.id)))).one()
    completed_count = (
        await session.exec(
            select(func.count(Video.id)).where(Video.downloadStatus == "completed")
        )
    ).one()
    total_bytes = 0
    if BUNDLES_DIR.exists():
        total_bytes += sum(
            f.stat().st_size for f in BUNDLES_DIR.rglob("*") if f.is_file()
        )
    if TEMP_DIR.exists():
        total_bytes += sum(
            f.stat().st_size for f in TEMP_DIR.rglob("*") if f.is_file()
        )
    return {
        "total_users": users_count,
        "total_videos": videos_count,
        "completed_downloads": completed_count,
        "total_storage_bytes": total_bytes,
        "formatted_storage": format_size(total_bytes),
    }


@router.get("/videos")
async def list_admin_videos(
    admin: User = Depends(require_admin), session: AsyncSession = Depends(get_session)
):
    """Returns detailed listing of all videos across all users with disk footprints."""
    result = await session.exec(select(Video))
    videos = result.all()
    user_map = {}
    users_res = await session.exec(select(User))
    for u in users_res.all():
        user_map[u.id] = u.username

    bundle_user_counts = {}
    for vid in videos:
        tb_id = vid.bundleId if vid.bundleId else vid.id
        bundle_user_counts[tb_id] = bundle_user_counts.get(tb_id, 0) + 1

    out = []
    for v in videos:
        target_bundle_id = v.bundleId if v.bundleId else v.id
        bundle_path = BundleManager.get_bundle_path(target_bundle_id)
        bytes_val = bundle_path.stat().st_size if bundle_path.exists() else 0
        mapped_count = bundle_user_counts.get(target_bundle_id, 1)

        v_dict = v.dict() if hasattr(v, "dict") else v.model_dump()
        v_dict.update(
            {
                "username": user_map.get(v.userId, "Unknown User"),
                "fullTitle": v.fullTitle or v.url,
                "url": v.url,
                "durationString": v.durationString or "N/A",
                "size": v.size or format_size(bytes_val),
                "resolution": v.resolution or "HD",
                "bytes": bytes_val,
                "formatted_bytes": format_size(bytes_val),
                "mapped_users_count": mapped_count,
            }
        )
        out.append(v_dict)

    out.sort(key=lambda x: x["bytes"], reverse=True)
    return out


@router.delete("/videos/{video_id}")
async def delete_admin_video(
    video_id: str,
    admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    """Admin hard deletion of a video and cleanup of underlying shared storage bundle."""
    result = await session.exec(select(Video).where(Video.id == video_id))
    video = result.first()
    if not video:
        raise HTTPException(status_code=404, detail="Video record not found")

    download_registry.cancel(video_id)
    target_bundle_id = video.bundleId if video.bundleId else video.id
    target_user_id = video.userId

    await session.delete(video)
    await session.commit()

    other_vids = await session.exec(
        select(Video).where(
            (Video.bundleId == target_bundle_id) | (Video.id == target_bundle_id)
        )
    )
    if not other_vids.first():
        bundle_path = BundleManager.get_bundle_path(target_bundle_id)
        if bundle_path.exists():
            try:
                bundle_path.unlink()
            except Exception:
                pass

    await send_remove_video(video_id, target_user_id)
    await send_admin_event("admin_stats_update")
    return {"status": "success", "id": video_id}
