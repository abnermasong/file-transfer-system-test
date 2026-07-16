from app.db.supabase import get_supabase_client


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
