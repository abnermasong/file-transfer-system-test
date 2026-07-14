import os

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
