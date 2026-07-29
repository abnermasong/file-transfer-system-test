from app.db.file_transfers import list_file_transfers, mark_file_transfer_deleted
from app.services.utils.file_transfers_status import get_actual_status


def get_admin_transfer_list() -> list[dict]:
    records = list_file_transfers()

    return [
        {
            "id": record["id"],
            "file_name": record["file_name"],
            "recipient_email": record["recipient_email"],
            "created_at": record["created_at"],
            "download_count": record["download_count"],
            "max_downloads": record["max_downloads"],
            "status": get_actual_status(record),
            "last_download_at": record["last_download_at"],
        }
        for record in records
    ]


def delete_transfer(file_transfer_id: str) -> None:
    mark_file_transfer_deleted(file_transfer_id)
