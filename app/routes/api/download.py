from fastapi import APIRouter

from app.services.download_service import get_download_page_state

router = APIRouter()


@router.get("/download/{download_token}/status")
def get_download_status(download_token: str):
    return get_download_page_state(download_token)
