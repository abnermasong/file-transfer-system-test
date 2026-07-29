from datetime import datetime, timezone

from app.db.file_transfers import update_file_transfer_status
from app.enums import FileTransferStatus


def _compute_actual_status(record: dict) -> FileTransferStatus:
    if record["status"] == FileTransferStatus.DELETED:
        return FileTransferStatus.DELETED

    if record["download_count"] >= record["max_downloads"]:
        return FileTransferStatus.DOWNLOAD_LIMIT_REACHED

    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) >= expires_at:
        return FileTransferStatus.EXPIRED

    return FileTransferStatus.AVAILABLE


def get_actual_status(record: dict) -> FileTransferStatus:

    actual_status = _compute_actual_status(record)

    # Sync actual status with file_transfers.status
    if actual_status != record["status"]:
        try:
            update_file_transfer_status(record["id"], actual_status)
        except Exception:
            pass

    return actual_status
