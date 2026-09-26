from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import src.config as config
from src.logger import log_warning
from src.models import Video
from src.VideoDownloader import download_registry


async def recover_stuck_videos(session: AsyncSession) -> bool:
    """Recovers dead tasks stuck in intermediate states or with missing bundle files."""
    stuck_statuses = ["downloading", "generating_sprites", "packing_bundle"]
    stuck_res = await session.exec(
        select(Video).where(Video.downloadStatus.in_(stuck_statuses))
    )
    stuck_videos = stuck_res.all()
    updated_any = False
    for v in stuck_videos:
        if not download_registry.is_active(v.id):
            v.downloadStatus = "failed"
            session.add(v)
            updated_any = True
            log_warning(
                f"[Cleanup Worker] Marked dead task video record '{v.id}' as failed."
            )
    completed_res = await session.exec(
        select(Video).where(Video.downloadStatus == "completed")
    )
    for v in completed_res.all():
        target_bundle_id = v.bundleId if v.bundleId else v.id
        bundle_path = config.BUNDLES_DIR / f"{target_bundle_id}.adaumc"
        if not bundle_path.exists():
            v.downloadStatus = "failed"
            v.downloaded = False
            session.add(v)
            updated_any = True
            log_warning(
                f"[Cleanup Worker] Marked video '{v.id}' as failed because bundle '{bundle_path.name}' is missing."
            )
    return updated_any
