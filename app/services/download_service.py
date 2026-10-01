import logging

from app.db.file_transfers import get_file_transfer_by_token, increment_download_count
from app.enums import DownloadPageState, FileTransferStatus
from app.services.utils.file_transfers_status import sync_actual_status
from app.services.utils.file_transfers_validation import (
    get_unexpired_available_file_transfer,
)
from app.services.utils.gcs import generate_signed_download_url
from app.services.utils.otp_attempts_validation import get_latest_unexpired_otp_attempt

logger = logging.getLogger(__name__)


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

    actual_status = sync_actual_status(record)
    page_state = _TRANSFER_STATUS_TO_PAGE_STATE.get(
        actual_status, DownloadPageState.NOT_FOUND
    )

    if page_state == DownloadPageState.OTP_REQUIRED:
        return {
            "state": page_state,
            "file_name": record["file_name"],
        }

    return {"state": page_state}


def get_download_url(download_token: str, ip_address: str | None) -> dict:
    generic_error = "ファイルをダウンロードできません。"

    record = get_unexpired_available_file_transfer(download_token)
    if record is None:
        logger.warning(
            "[Download - File Transfer Unavailable - get_download_url]: No available file transfer"
        )
        raise FileDownloadError(generic_error)

    # File can only be downloaded in limited times
    if record["download_count"] >= record["max_downloads"]:
        logger.warning(
            "[Download - Download Limit Reached - get_download_url]: transfer_id=%s, download_count=%s, max_downloads=%s",
            record["id"],
            record["download_count"],
            record["max_downloads"],
        )
        raise FileDownloadError(
            "ダウンロード回数の上限に達しました。送信者に新しいリンクを依頼してください。"
        )
    attempt = get_latest_unexpired_otp_attempt(record["id"])
    if attempt is None:
        logger.warning(
            "[Download - No Unexpired OTP Attempt - get_download_url]: transfer_id=%s",
            record["id"],
        )
        raise FileDownloadError(generic_error)

    otp_has_been_verified = attempt["used_at"] is not None
    if not otp_has_been_verified:
        logger.warning(
            "[Download - OTP Not Verified - get_download_url]: transfer_id=%s, attempt_id=%s",
            record["id"],
            attempt["id"],
        )
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
        logger.warning(
            "[Download - Download Count Update Failed - get_download_url]: transfer_id=%s, expected_count=%s, max_downloads=%s",
            record["id"],
            record["download_count"],
            record["max_downloads"],
        )
        raise FileDownloadError(
            "ダウンロード回数の上限に達しました。送信者に新しいリンクを依頼してください。"
        )

    return {"download_url": signed_url, "file_name": record["file_name"]}
