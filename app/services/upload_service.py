import mimetypes
import os

from app.db.file_transfers import insert_file_transfer
from app.services.utils.date_formatter import format_expiration_datetime
from app.services.utils.gcs import delete_file_from_gcs, upload_file_to_gcs
from app.services.utils.resend import send_upload_notification_email
from app.services.utils.token import generate_download_token

MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "")) * 1024 * 1024


class UploadValidationError(Exception):
    pass


class UploadFileTooLargeError(Exception):
    pass


class UploadStorageError(Exception):
    pass


class UploadDatabaseError(Exception):
    pass


def process_upload(
    file_obj, filename: str, content_type: str | None, recipient_email: str
) -> dict:
    if not recipient_email or "@" not in recipient_email:
        raise UploadValidationError("有効なメールアドレスを入力してください。")

    file_obj.seek(0, os.SEEK_END)
    file_size = file_obj.tell()
    file_obj.seek(0)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise UploadFileTooLargeError(
            f"ファイルサイズが{MAX_FILE_SIZE_BYTES // (1024 * 1024)}MBの上限を超えています。"
        )

    download_token = generate_download_token()
    storage_path = f"{download_token}/{filename}"
    resolved_content_type = content_type or mimetypes.guess_type(filename)[0]

    try:
        upload_file_to_gcs(file_obj, storage_path, content_type=resolved_content_type)
    except Exception as storage_error:
        raise UploadStorageError(
            "ファイルのアップロード中に問題が発生しました。"
        ) from storage_error

    try:
        record = insert_file_transfer(
            file_name=filename,
            storage_path=storage_path,
            file_size=file_size,
            recipient_email=recipient_email,
            download_token=download_token,
        )
    except Exception as db_error:
        # Undo the GCS upload so we don't end up with a file that has no DB record pointing to it.
        try:
            delete_file_from_gcs(storage_path)
        except Exception as cleanup_error:
            raise UploadDatabaseError(
                "ファイルのアップロード中に問題が発生しました。"
            ) from cleanup_error

        raise UploadDatabaseError(
            "ファイルのアップロード中に問題が発生しました。"
        ) from db_error

    try:
        formatted_expires_at = format_expiration_datetime(record["expires_at"])

        frontend_url = os.getenv("FRONTEND_URL", "")
        download_url = f"{frontend_url}/d/{download_token}"

        send_upload_notification_email(
            recipient_email=recipient_email,
            file_name=filename,
            download_url=download_url,
            expires_at=formatted_expires_at,
        )
    except Exception:
        record["email_warning"] = (
            "ファイルはアップロードされましたが、通知メールを送信できませんでした。"
        )

    return record
