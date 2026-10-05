import pytest
import uuid
from sqlmodel import select
from src.models import Playlist, PlaylistVideoLink, Video, User
from src.db.session import async_session_maker

PLAYLIST_LIFECYCLE_DATASETS = [
    {"user_seed": f"pl_u_{i}", "playlist_name": f"Playlist Album #{i}", "video_count": i + 1}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", PLAYLIST_LIFECYCLE_DATASETS, ids=[f"pl_life_{i}" for i in range(10)])
async def test_playlist_sync_lifecycle_10_datasets(dataset):
    uid = f"usr_{uuid.uuid4().hex[:8]}"
    uname = f"u_{uuid.uuid4().hex[:8]}"
    pl_id = f"pl_{uuid.uuid4().hex[:8]}"
    
    async with async_session_maker() as session:
        # Create user
        user = User(
            id=uid,
            username=uname,
            hashed_password="hashed_pw",
            role="user",
        )
        session.add(user)
        
        # Create playlist
        playlist = Playlist(
            id=pl_id,
            name=dataset["playlist_name"],
            userId=uid,
        )
        session.add(playlist)
        await session.commit()

        # Add videos and link them
        for v_idx in range(dataset["video_count"]):
            v_id = f"vid_{uuid.uuid4().hex[:8]}"
            video = Video(
                id=v_id,
                userId=uid,
                title=f"Video Item {v_idx}",
                url=f"https://example.com/{v_id}",
                downloadStatus="completed",
                downloaded=True,
            )
            session.add(video)
            
            link = PlaylistVideoLink(
                playlist_id=playlist.id,
                video_id=v_id,
            )
            session.add(link)
        
        await session.commit()

        # Query and verify
        res = await session.exec(select(PlaylistVideoLink).where(PlaylistVideoLink.playlist_id == playlist.id))
        links = res.all()
        assert len(links) == dataset["video_count"]
