from enum import StrEnum


class FileTransferStatus(StrEnum):
    UPLOADED = "uploaded"
    AVAILABLE = "available"
    DOWNLOAD_LIMIT_REACHED = "download_limit_reached"
    EXPIRED = "expired"
    DELETED = "deleted"


class DownloadPageState(StrEnum):
    OTP_REQUIRED = "otp_required"
    DOWNLOAD_LIMIT_REACHED = "download_limit_reached"
    EXPIRED = "expired"
    NOT_FOUND = "not_found"
