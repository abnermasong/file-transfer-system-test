import logging

from app.db.otp_attempts import (
    count_otp_attempts,
    increment_otp_attempt_failures,
    insert_otp_attempt,
    mark_otp_attempt_used,
)
from app.services.utils.file_transfers_validation import (
    get_unexpired_available_file_transfer,
)
from app.services.utils.otp import generate_otp, hash_otp, otp_matches_hash
from app.services.utils.otp_attempts_validation import get_latest_unexpired_otp_attempt
from app.services.utils.resend import send_otp_email

MAX_OTP_REQUEST = 15
MAX_OTP_FAILED_ATTEMPTS = 5

logger = logging.getLogger(__name__)


class OtpRequestError(Exception):
    pass


class OtpVerificationError(Exception):
    pass


def request_otp(download_token: str, ip_address: str | None) -> dict:
    record = get_unexpired_available_file_transfer(download_token)
    if record is None:
        logger.warning(
            "[OTP - File Transfer Unavailable - request_otp]: No available file transfer"
        )
        raise OtpRequestError("このリンク先へOTPを送信できませんでした。")

    # OTP can only be requested in limited times
    if count_otp_attempts(record["id"]) >= MAX_OTP_REQUEST:
        logger.warning(
            "[OTP - Request Limit Reached - request_otp]: transfer_id=%s, limit=%s",
            record["id"],
            MAX_OTP_REQUEST,
        )
        raise OtpRequestError(
            "このリンクのOTPリクエスト上限に達しました。送信者に新しいリンクをリクエストしてください。"
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
    generic_error = "OTPが無効か、有効期限が切れています"

    record = get_unexpired_available_file_transfer(download_token)
    if record is None:
        logger.warning(
            "[OTP - File Transfer Unavailable - verify_otp]: No available file transfer"
        )
        raise OtpVerificationError(generic_error)

    attempt = get_latest_unexpired_otp_attempt(record["id"])
    if attempt is None:
        logger.warning(
            "[OTP - No Unexpired Attempt - verify_otp]: transfer_id=%s",
            record["id"],
        )
        raise OtpVerificationError(generic_error)

    otp_was_already_used = attempt["used_at"] is not None
    if otp_was_already_used:
        logger.warning(
            "[OTP - Already Used - verify_otp]: transfer_id=%s, attempt_id=%s",
            record["id"],
            attempt["id"],
        )
        raise OtpVerificationError(generic_error)

    # OTP can only be verified in limited times
    failure_limit_reached = attempt["failed_attempts"] >= MAX_OTP_FAILED_ATTEMPTS
    if failure_limit_reached:
        logger.warning(
            "[OTP - Failure Limit Reached - verify_otp]: transfer_id=%s, attempt_id=%s, failed_attempts=%s",
            record["id"],
            attempt["id"],
            attempt["failed_attempts"],
        )
        raise OtpVerificationError(generic_error)

    submitted_otp_matches = otp_matches_hash(submitted_otp, attempt["otp_hash"])
    if not submitted_otp_matches:
        increment_otp_attempt_failures(attempt["id"], attempt["failed_attempts"] + 1)
        logger.warning(
            "[OTP - Mismatch - verify_otp]: transfer_id=%s, attempt_id=%s, failed_attempts=%s",
            record["id"],
            attempt["id"],
            attempt["failed_attempts"] + 1,
        )
        raise OtpVerificationError(generic_error)

    mark_otp_attempt_used(attempt["id"])

    return {"file_name": record["file_name"]}
