from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.upload_service import (
    UploadStorageError,
    UploadValidationError,
    process_upload,
)

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        result = process_upload(file.file, file.filename, file.content_type)
    except UploadValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except UploadStorageError as e:
        raise HTTPException(status_code=502, detail=str(e))

    return {**result}
