from datetime import datetime, timezone

from app.db.file_transfers import get_file_transfer_by_token, increment_download_count
from app.db.otp_attempts import get_latest_otp_attempt
from app.enums import DownloadPageState, FileTransferStatus
from app.services.utils.gcs import generate_signed_download_url


class FileDownloadError(Exception):
    pass


_TRANSFER_STATUS_TO_PAGE_STATE = {
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


def get_download_url(download_token: str, ip_address: str | None) -> dict:
    generic_error = "Unable to download this file."

    record = get_file_transfer_by_token(download_token)
    if record is None:
        raise FileDownloadError(generic_error)

    if record["status"] != FileTransferStatus.AVAILABLE:
        raise FileDownloadError(generic_error)

    expires_at = datetime.fromisoformat(record["expires_at"])
    if datetime.now(timezone.utc) >= expires_at:
        raise FileDownloadError(generic_error)

    if record["download_count"] >= record["max_downloads"]:
        raise FileDownloadError("Download limit reached.")

    attempt = get_latest_otp_attempt(record["id"])
    if attempt is None:
        raise FileDownloadError(generic_error)

    if attempt["used_at"] is None:
        raise FileDownloadError(generic_error)

    otp_expires_at = datetime.fromisoformat(attempt["expires_at"])
    if datetime.now(timezone.utc) >= otp_expires_at:
        raise FileDownloadError(generic_error)

    signed_url = generate_signed_download_url(
        record["storage_path"], record["file_name"]
    )

    updated = increment_download_count(
        file_transfer_id=record["id"],
        expected_count=record["download_count"],
        max_downloads=record["max_downloads"],
        ip_address=ip_address,
    )

    if updated is None:
        raise FileDownloadError("Download limit reached.")

    return {"download_url": signed_url, "file_name": record["file_name"]}
