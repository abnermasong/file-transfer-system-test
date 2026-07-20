from datetime import datetime, timezone

from app.db.supabase import get_supabase_client


def insert_otp_attempt(
    *, file_transfer_id: str, otp_hash: str, ip_address: str | None
) -> dict:
    client = get_supabase_client()
    result = (
        client.table("otp_attempts")
        .insert(
            {
                "file_transfer_id": file_transfer_id,
                "otp_hash": otp_hash,
                "ip_address": ip_address,
            }
        )
        .execute()
    )
    return result.data[0]


def get_latest_otp_attempt(file_transfer_id: str) -> dict | None:
    client = get_supabase_client()
    result = (
        client.table("otp_attempts")
        .select("*")
        .eq("file_transfer_id", file_transfer_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def mark_otp_attempt_used(otp_attempt_id: str) -> None:
    client = get_supabase_client()
    client.table("otp_attempts").update(
        {"used_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", otp_attempt_id).execute()


def increment_otp_attempt_failures(
    otp_attempt_id: str, new_failed_attempts: int
) -> None:
    client = get_supabase_client()
    client.table("otp_attempts").update({"failed_attempts": new_failed_attempts}).eq(
        "id", otp_attempt_id
    ).execute()


def count_otp_attempts(file_transfer_id: str) -> int:
    client = get_supabase_client()
    result = (
        client.table("otp_attempts")
        .select("id", count="exact")
        .eq("file_transfer_id", file_transfer_id)
        .execute()
    )
    return result.count or 0
