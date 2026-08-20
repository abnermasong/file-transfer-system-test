from datetime import datetime, timezone

from app.db.file_transfers import get_file_transfer_by_token
from app.enums import FileTransferStatus
from app.services.utils.file_transfers_status import sync_actual_status


def get_unexpired_available_file_transfer(download_token: str) -> dict | None:
    record = get_file_transfer_by_token(download_token)

    if record is None:
        return None

    actual_status = sync_actual_status(record)
    if actual_status != FileTransferStatus.AVAILABLE:
        return None

    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) >= expires_at:
        return None

    return record
