from fastapi import APIRouter

from app.services.admin_service import delete_transfer, get_admin_transfer_list

router = APIRouter()


@router.get("/admin/transfers")
def get_transfers():
    return {"transfers": get_admin_transfer_list()}


@router.delete("/admin/transfers/{file_transfer_id}")
def delete_transfer_route(file_transfer_id: str):
    delete_transfer(file_transfer_id)
    return {"success": True}
