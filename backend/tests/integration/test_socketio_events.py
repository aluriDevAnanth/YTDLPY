import pytest
from unittest.mock import AsyncMock, patch
from src.sio import send_video_message, send_startup_event, send_admin_event

SIO_DATASETS = [
    {
        "video_id": f"sio_vid_{i:02d}",
        "user_id": f"sio_usr_{i:02d}",
        "status": ["downloading", "generating_sprites", "packing_bundle", "completed"][i % 4],
        "percent": (i * 25) % 100,
    }
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", SIO_DATASETS, ids=[f"sio_ds_{i}" for i in range(10)])
async def test_socketio_event_dispatch_10_datasets(dataset):
    with patch("src.sio.sio.emit", new_callable=AsyncMock) as mock_emit:
        # 1. Send video message
        video_payload = {
            "id": dataset["video_id"],
            "downloadStatus": dataset["status"],
            "progress": dataset["percent"],
        }
        await send_video_message(video_payload, dataset["user_id"])
        assert mock_emit.called
        call_args = mock_emit.call_args[0]
        assert call_args[0] == "message"
        assert call_args[1]["id"] == dataset["video_id"]
        assert mock_emit.call_args.kwargs["room"] == f"user_{dataset['user_id']}"
        
        # 2. Send startup event
        mock_emit.reset_mock()
        await send_startup_event(message=f"Startup step {dataset['video_id']}", typee="ongoing")
        assert mock_emit.called
        call_args_startup = mock_emit.call_args[0]
        assert call_args_startup[0] == "startupp"
        assert call_args_startup[1]["sseType"] == "startupp"
        
        # 3. Send admin event
        mock_emit.reset_mock()
        await send_admin_event("admin_stats_update", {"active": True, "id": dataset["video_id"]})
        assert mock_emit.called
        call_args_admin = mock_emit.call_args[0]
        assert call_args_admin[0] == "admin_stats_update"
        assert mock_emit.call_args.kwargs["room"] == "admin_room"
