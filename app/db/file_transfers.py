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
    if new_count >= max_downloads:
        new_status = FileTransferStatus.DOWNLOAD_LIMIT_REACHED
    else:
        new_status = FileTransferStatus.AVAILABLE

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


def update_file_transfer_status(
    file_transfer_id: str, status: FileTransferStatus
) -> None:
    client = get_supabase_client()
    client.table("file_transfers").update({"status": status}).eq(
        "id", file_transfer_id
    ).execute()


def update_file_transfers_status_bulk(
    file_transfer_ids: list[str], status: FileTransferStatus
) -> None:
    if not file_transfer_ids:
        return
    client = get_supabase_client()
    client.table("file_transfers").update({"status": status}).in_(
        "id", file_transfer_ids
    ).execute()


def list_file_transfers(offset: int, limit: int) -> tuple[list[dict], int]:
    client = get_supabase_client()
    result = (
        client.table("file_transfers")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or [], result.count or 0


def mark_file_transfer_deleted(file_transfer_id: str) -> None:
    update_file_transfer_status(file_transfer_id, FileTransferStatus.DELETED)
