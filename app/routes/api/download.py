from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

from app.services.download_service import (
    FileDownloadError,
    get_download_page_state,
    get_download_url,
)
from app.services.otp_service import (
    OtpRequestError,
    OtpVerificationError,
    request_otp,
    verify_otp,
)

router = APIRouter()


class OtpVerifyPayload(BaseModel):
    otp: str


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


@router.post("/download/{download_token}/otp/verify")
def verify_download_otp(download_token: str, payload: OtpVerifyPayload):
    try:
        result = verify_otp(download_token, payload.otp)
    except OtpVerificationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return {"success": True, **result}


@router.get("/download/{download_token}/file")
def get_file_download(download_token: str, request: Request):
    ip_address = request.client.host if request.client else None

    try:
        result = get_download_url(download_token, ip_address)
    except FileDownloadError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return result
