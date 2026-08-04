from datetime import datetime
from zoneinfo import ZoneInfo


def format_expiration_datetime(expires_at: str | datetime) -> str:
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))

    expires_at_jst = expires_at.astimezone(ZoneInfo("Asia/Tokyo"))

    return expires_at_jst.strftime("%Y年%m月%d日 %H:%M（日本時間）")
