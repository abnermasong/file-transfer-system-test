import logging
from datetime import UTC, datetime

from app.db.file_transfers import (
    update_file_transfer_status,
    update_file_transfers_status_bulk,
)
from app.enums import FileTransferStatus

logger = logging.getLogger(__name__)


def get_actual_status(record: dict) -> FileTransferStatus:
    if record["status"] == FileTransferStatus.DELETED:
        return FileTransferStatus.DELETED

    if record["download_count"] >= record["max_downloads"]:
        return FileTransferStatus.DOWNLOAD_LIMIT_REACHED

    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(UTC) >= expires_at:
        return FileTransferStatus.EXPIRED

    return FileTransferStatus.AVAILABLE


def sync_actual_status(record: dict) -> FileTransferStatus:
    """
    Reflect actual status to db (except /admin)
    """

    actual_status = get_actual_status(record)

    if actual_status != record["status"]:
        try:
            update_file_transfer_status(record["id"], actual_status)
        except Exception:
            logger.exception(
                "[File Transfer - Status Update Failed - sync_actual_status]: transfer_id=%s, status=%s",
                record["id"],
                actual_status,
            )

    return actual_status


def sync_actual_statuses_bulk(records: list[dict]) -> None:
    """
    Reflect actual statuses to db (for /admin)
    """

    to_expire = []
    to_limit_reached = []

    for record in records:
        actual_status = get_actual_status(record)
        if actual_status == record["status"]:
            continue
        if actual_status == FileTransferStatus.EXPIRED:
            to_expire.append(record["id"])
        elif actual_status == FileTransferStatus.DOWNLOAD_LIMIT_REACHED:
            to_limit_reached.append(record["id"])

    try:
        update_file_transfers_status_bulk(to_expire, FileTransferStatus.EXPIRED)
        update_file_transfers_status_bulk(
            to_limit_reached, FileTransferStatus.DOWNLOAD_LIMIT_REACHED
        )
    except Exception:
        logger.exception(
            "[File Transfer - Bulk Status Update Failed - sync_actual_statuses_bulk]: to_expire=%s, to_limit_reached=%s",
            to_expire,
            to_limit_reached,
        )
