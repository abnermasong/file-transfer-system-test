from datetime import datetime, timezone

from app.db.file_transfers import get_file_transfer_by_token
from app.db.otp_attempts import (
    count_otp_attempts,
    get_latest_otp_attempt,
    increment_otp_attempt_failures,
    insert_otp_attempt,
    mark_otp_attempt_used,
)
from app.enums import FileTransferStatus
from app.services.utils.otp import generate_otp, hash_otp, otp_matches_hash
from app.services.utils.resend import send_otp_email

MAX_OTP_REQUEST = 15
MAX_OTP_FAILED_ATTEMPTS = 5


class OtpRequestError(Exception):
    pass


class OtpVerificationError(Exception):
    pass


def request_otp(download_token: str, ip_address: str | None) -> dict:
    record = get_file_transfer_by_token(download_token)

    if record is None:
        raise OtpRequestError("Unable to send a one-time code for this link.")

    if record["status"] != FileTransferStatus.AVAILABLE:
        raise OtpRequestError("Unable to send a one-time code for this link.")

    if count_otp_attempts(record["id"]) >= MAX_OTP_REQUEST:
        raise OtpRequestError(
            "Too many one-time code requests for this file. Please contact the sender for a new link."
        )

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    insert_otp_attempt(
        file_transfer_id=record["id"],
        otp_hash=otp_hash,
        ip_address=ip_address,
    )

    send_otp_email(recipient_email=record["recipient_email"], otp=otp)

    return {"file_name": record["file_name"]}


def verify_otp(download_token: str, submitted_otp: str) -> dict:
    generic_error = "This code is invalid or has expired."

    record = get_file_transfer_by_token(download_token)
    if record is None:
        raise OtpVerificationError(generic_error)

    if record["status"] != FileTransferStatus.AVAILABLE:
        raise OtpVerificationError(generic_error)

    attempt = get_latest_otp_attempt(record["id"])
    if attempt is None:
        raise OtpVerificationError(generic_error)

    if attempt["used_at"] is not None:
        raise OtpVerificationError(generic_error)

    if attempt["failed_attempts"] >= MAX_OTP_FAILED_ATTEMPTS:
        raise OtpVerificationError(generic_error)

    expires_at = datetime.fromisoformat(attempt["expires_at"])
    if datetime.now(timezone.utc) >= expires_at:
        raise OtpVerificationError(generic_error)

    submitted_otp_matches = otp_matches_hash(submitted_otp, attempt["otp_hash"])
    if not submitted_otp_matches:
        increment_otp_attempt_failures(attempt["id"], attempt["failed_attempts"] + 1)
        raise OtpVerificationError(generic_error)

    mark_otp_attempt_used(attempt["id"])

    return {"file_name": record["file_name"]}
