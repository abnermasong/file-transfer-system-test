from fastapi import APIRouter, HTTPException, Request, status

from app.services.download_service import get_download_page_state
from app.services.otp_service import OtpRequestError, request_otp

router = APIRouter()


@router.get("/download/{download_token}/status")
def get_download_status(download_token: str):
    return get_download_page_state(download_token)


@router.post("/download/{download_token}/otp")
def request_download_otp(download_token: str, request: Request):
    ip_address = request.client.host if request.client else None

    try:
        result = request_otp(download_token, ip_address)
    except OtpRequestError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return {"success": True, **result}
