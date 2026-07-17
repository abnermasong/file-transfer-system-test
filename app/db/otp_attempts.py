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
