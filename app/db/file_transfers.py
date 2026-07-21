from datetime import datetime, timezone

from app.db.supabase import get_supabase_client
from app.enums import FileTransferStatus


def insert_file_transfer(
    *,
    file_name: str,
    storage_path: str,
    file_size: int,
    recipient_email: str,
    download_token: str,
) -> dict:
    client = get_supabase_client()
    result = (
        client.table("file_transfers")
        .insert(
            {
                "file_name": file_name,
                "storage_path": storage_path,
                "file_size": file_size,
                "recipient_email": recipient_email,
                "download_token": download_token,
            }
        )
        .execute()
    )
    return result.data[0]


def get_file_transfer_by_token(download_token: str) -> dict | None:
    client = get_supabase_client()
    result = (
        client.table("file_transfers")
        .select("*")
        .eq("download_token", download_token)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def increment_download_count(
    *,
    file_transfer_id: str,
    expected_count: int,
    max_downloads: int,
    ip_address: str | None,
) -> dict | None:
    client = get_supabase_client()

    new_count = expected_count + 1
    new_status = (
        FileTransferStatus.DOWNLOAD_LIMIT_REACHED
        if new_count >= max_downloads
        else FileTransferStatus.AVAILABLE
    )

    result = (
        client.table("file_transfers")
        .update(
            {
                "download_count": new_count,
                "last_download_at": datetime.now(timezone.utc).isoformat(),
                "last_download_ip": ip_address,
                "status": new_status,
            }
        )
        .eq("id", file_transfer_id)
        .eq("download_count", expected_count)
        .execute()
    )
    return result.data[0] if result.data else None
