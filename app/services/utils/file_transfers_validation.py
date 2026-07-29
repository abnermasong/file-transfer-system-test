from datetime import datetime, timezone

from app.db.file_transfers import get_file_transfer_by_token
from app.enums import FileTransferStatus


def get_unexpired_available_file_transfer(download_token: str) -> dict | None:
    record = get_file_transfer_by_token(download_token)

    if record is None:
        return None

    if record["status"] != FileTransferStatus.AVAILABLE:
        return None

    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) >= expires_at:
        return None

    return record
