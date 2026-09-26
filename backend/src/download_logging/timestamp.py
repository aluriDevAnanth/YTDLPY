from datetime import datetime, timezone


def get_iso8601_utc_timestamp() -> str:
    """Returns ISO 8601 UTC timestamp in YYYY-MM-DDTHH:mm:ss.sssZ format."""
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
