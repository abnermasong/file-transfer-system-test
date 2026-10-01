import logging
from datetime import UTC, datetime

from app.db.file_transfers import get_file_transfer_by_token
from app.enums import FileTransferStatus
from app.services.utils.file_transfers_status import sync_actual_status

logger = logging.getLogger(__name__)


def get_unexpired_available_file_transfer(download_token: str) -> dict | None:
    record = get_file_transfer_by_token(download_token)

    if record is None:
        logger.warning(
            "[File Transfer - Not Found - get_unexpired_available_file_transfer]: No matching file transfer"
        )
        return None

    actual_status = sync_actual_status(record)
    if actual_status != FileTransferStatus.AVAILABLE:
        logger.warning(
            "[File Transfer - Unavailable - get_unexpired_available_file_transfer]: transfer_id=%s, status=%s",
            record["id"],
            actual_status,
        )
        return None

    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(UTC) >= expires_at:
        logger.warning(
            "[File Transfer - Expired - get_unexpired_available_file_transfer]: transfer_id=%s",
            record["id"],
        )
        return None

    return record
