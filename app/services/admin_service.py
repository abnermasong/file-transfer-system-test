from app.db.file_transfers import list_file_transfers, mark_file_transfer_deleted
from app.services.utils.file_transfers_status import get_actual_status


def get_admin_transfer_list(page: int, page_size: int) -> dict:
    offset = (page - 1) * page_size
    records, total = list_file_transfers(offset, page_size)

    transfers = [
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

    return {
        "transfers": transfers,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


def delete_transfer(file_transfer_id: str) -> None:
    mark_file_transfer_deleted(file_transfer_id)
