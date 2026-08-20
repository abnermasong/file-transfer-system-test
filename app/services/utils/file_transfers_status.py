from datetime import datetime, timezone

from app.enums import FileTransferStatus
from app.db.file_transfers import (
    update_file_transfer_status,
    update_file_transfers_status_bulk,
)


def get_actual_status(record: dict) -> FileTransferStatus:
    if record["status"] == FileTransferStatus.DELETED:
        return FileTransferStatus.DELETED

    if record["download_count"] >= record["max_downloads"]:
        return FileTransferStatus.DOWNLOAD_LIMIT_REACHED

    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) >= expires_at:
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
            pass

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
        pass
