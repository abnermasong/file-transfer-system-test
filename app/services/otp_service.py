from app.db.file_transfers import get_file_transfer_by_token
from app.db.otp_attempts import insert_otp_attempt
from app.enums import FileTransferStatus
from app.services.utils.otp import generate_otp, hash_otp
from app.services.utils.resend import send_otp_email


class OtpRequestError(Exception):
    pass


def request_otp(download_token: str, ip_address: str | None) -> dict:
    record = get_file_transfer_by_token(download_token)

    if record is None:
        raise OtpRequestError("Unable to send a one-time code for this link.")

    if record["status"] != FileTransferStatus.AVAILABLE:
        raise OtpRequestError("Unable to send a one-time code for this link.")

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    insert_otp_attempt(
        file_transfer_id=record["id"],
        otp_hash=otp_hash,
        ip_address=ip_address,
    )

    send_otp_email(recipient_email=record["recipient_email"], otp=otp)

    return {"file_name": record["file_name"]}
