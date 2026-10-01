import logging
from datetime import UTC, datetime

from app.db.otp_attempts import get_latest_otp_attempt

logger = logging.getLogger(__name__)


def get_latest_unexpired_otp_attempt(file_transfer_id: str) -> dict | None:
    attempt = get_latest_otp_attempt(file_transfer_id)

    if attempt is None:
        logger.warning(
            "[OTP - Attempt Not Found - get_latest_unexpired_otp_attempt]: transfer_id=%s",
            file_transfer_id,
        )
        return None

    expires_at = datetime.fromisoformat(attempt["expires_at"])
    if datetime.now(UTC) >= expires_at:
        logger.warning(
            "[OTP - Attempt Expired - get_latest_unexpired_otp_attempt]: transfer_id=%s, attempt_id=%s",
            file_transfer_id,
            attempt["id"],
        )
        return None

    return attempt
