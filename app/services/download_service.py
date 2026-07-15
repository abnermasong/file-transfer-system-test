from app.db.file_transfers import get_file_transfer_by_token
from app.enums import DownloadPageState, FileTransferStatus


_TRANSFER_STATUS_TO_PAGE_STATE = {
    FileTransferStatus.UPLOADED: DownloadPageState.OTP_REQUIRED,
    FileTransferStatus.AVAILABLE: DownloadPageState.OTP_REQUIRED,
    FileTransferStatus.DOWNLOAD_LIMIT_REACHED: (
        DownloadPageState.DOWNLOAD_LIMIT_REACHED
    ),
    FileTransferStatus.EXPIRED: DownloadPageState.EXPIRED,
    FileTransferStatus.DELETED: DownloadPageState.NOT_FOUND,
}


def get_download_page_state(download_token: str) -> dict:
    """Determine what the download page should display for a download_token."""

    record = get_file_transfer_by_token(download_token)

    if record is None:
        return {"state": DownloadPageState.NOT_FOUND}

    page_state = _TRANSFER_STATUS_TO_PAGE_STATE.get(
        record["status"], DownloadPageState.NOT_FOUND
    )

    if page_state == DownloadPageState.OTP_REQUIRED:
        return {
            "state": page_state,
            "file_name": record["file_name"],
        }

    return {"state": page_state}
