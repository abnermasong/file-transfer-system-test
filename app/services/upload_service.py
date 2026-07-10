import mimetypes
import os

from app.services.utils.gcs import upload_file_to_gcs
from app.services.utils.token import generate_download_token

MAX_FILE_SIZE_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", "")) * 1024 * 1024


class UploadValidationError(Exception):
    pass


class UploadStorageError(Exception):
    pass


def process_upload(file_obj, filename: str, content_type: str | None) -> dict:
    file_obj.seek(0, os.SEEK_END)
    file_size = file_obj.tell()
    file_obj.seek(0)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise UploadValidationError(
            f"File exceeds the {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB limit."
        )

    download_token = generate_download_token()
    storage_path = f"{download_token}/{filename}"
    resolved_content_type = content_type or mimetypes.guess_type(filename)[0]

    try:
        upload_file_to_gcs(file_obj, storage_path, content_type=resolved_content_type)
    except Exception as e:
        raise UploadStorageError("Failed to store file. Please try again.") from e

    return {
        "file_name": filename,
        "file_size": file_size,
        "storage_path": storage_path,
        "download_token": download_token,
    }
