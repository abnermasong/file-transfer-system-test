from datetime import datetime
from zoneinfo import ZoneInfo


def format_expiration_datetime(expires_at: str | datetime) -> str:
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))

    expires_at_jst = expires_at.astimezone(ZoneInfo("Asia/Tokyo"))

    date_text = expires_at_jst.strftime("%B %d, %Y")
    time_text = expires_at_jst.strftime("%I:%M %p").lstrip("0")

    return f"{date_text} at {time_text} JST"
