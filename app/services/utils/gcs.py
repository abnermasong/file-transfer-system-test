import os
from datetime import timedelta

from google.cloud import storage

_client = None


def _get_gcs_client():
    global _client
    if _client is None:
        creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
        if creds_path:
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path
        _client = storage.Client()
    return _client


def upload_file_to_gcs(
    file_obj, storage_path: str, content_type: str | None = None
) -> None:
    bucket_name = os.getenv("GCS_BUCKET_NAME", "")
    bucket = _get_gcs_client().bucket(bucket_name)
    blob = bucket.blob(storage_path)
    blob.upload_from_file(file_obj, content_type=content_type)


def delete_file_from_gcs(storage_path: str) -> None:
    bucket_name = os.getenv("GCS_BUCKET_NAME", "")
    bucket = _get_gcs_client().bucket(bucket_name)
    blob = bucket.blob(storage_path)
    blob.delete()


def generate_signed_download_url(
    storage_path: str, file_name: str, expiry_minutes: int = 1
) -> str:
    """
    Generates a short-lived signed URL so the browser can download directly
    from GCS. This is computed locally with the service account's private
    key — no network round trip to GCS, so it's essentially instant.
    """
    bucket_name = os.getenv("GCS_BUCKET_NAME", "")
    bucket = _get_gcs_client().bucket(bucket_name)
    blob = bucket.blob(storage_path)

    return blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=expiry_minutes),
        method="GET",
        response_disposition=f'attachment; filename="{file_name}"',
    )
