import pytest
from unittest.mock import AsyncMock, patch
from src.sio import send_video_message

PROGRESS_STREAM_DATASETS = [
    {"video_id": f"vid_prog_{i}", "user_id": f"u_prog_{i}", "speed": f"{i+1}.5 MB/s", "eta": f"00:{30-i*2:02d}", "percent": i * 10}
    for i in range(10)
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", PROGRESS_STREAM_DATASETS, ids=[f"prog_ds_{i}" for i in range(10)])
async def test_sse_progress_milestone_dispatch_10_datasets(dataset):
    with patch("src.sio.sio.emit", new_callable=AsyncMock) as mock_emit:
        payload = {
            "id": dataset["video_id"],
            "downloadStatus": "downloading",
            "progress": {
                "percent": dataset["percent"],
                "speed": dataset["speed"],
                "eta": dataset["eta"],
                "downloadedSize": f"{dataset['percent']} MB / 100 MB",
            }
        }
        await send_video_message(payload, dataset["user_id"])
        
        assert mock_emit.called
        event_name, data = mock_emit.call_args[0]
        assert event_name == "message"
        assert data["id"] == dataset["video_id"]
        assert data["progress"]["percent"] == dataset["percent"]
        assert data["progress"]["speed"] == dataset["speed"]
        assert mock_emit.call_args.kwargs["room"] == f"user_{dataset['user_id']}"
