from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query

from app.dependencies import require_admin_session
from app.services.admin_service import delete_transfer, get_admin_transfer_list

router = APIRouter(dependencies=[Depends(require_admin_session)])


@router.get("/admin/transfers")
def get_transfers(
    background_tasks: BackgroundTasks,
    page: int = Query(1, ge=1),
    page_size: int = Query(25),
):
    if page_size not in {25, 50, 100}:
        raise HTTPException(
            status_code=422,
            detail="1ページの表示件数は25、50、100のいずれかを指定してください。",
        )

    return get_admin_transfer_list(page, page_size, background_tasks)


@router.delete("/admin/transfers/{file_transfer_id}")
def delete_transfer_route(file_transfer_id: str):
    delete_transfer(file_transfer_id)
    return {"success": True}
