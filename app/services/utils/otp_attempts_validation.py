from datetime import datetime, timezone

from app.db.otp_attempts import get_latest_otp_attempt


def get_latest_unexpired_otp_attempt(file_transfer_id: str) -> dict | None:
    attempt = get_latest_otp_attempt(file_transfer_id)

    if attempt is None:
        return None

    expires_at = datetime.fromisoformat(attempt["expires_at"])
    if datetime.now(timezone.utc) >= expires_at:
        return None

    return attempt
