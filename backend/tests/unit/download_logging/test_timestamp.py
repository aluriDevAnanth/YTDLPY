import re
import datetime
from src.download_logging.timestamp import get_iso8601_utc_timestamp

def test_iso8601_utc_timestamp_format_10_iterations():
    for _ in range(10):
        ts = get_iso8601_utc_timestamp()
        assert isinstance(ts, str)
        # Should end with Z
        assert ts.endswith("Z")
        # Should be ISO parseable
        parsed = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
        assert parsed.tzinfo is not None
