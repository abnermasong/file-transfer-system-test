from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.services.upload_service import (
    UploadStorageError,
    UploadValidationError,
    UploadFileTooLargeError,
    UploadDatabaseError,
    process_upload,
)

router = APIRouter()


@router.post("/upload")
def upload_file(recipient_email: str = Form(...), file: UploadFile = File(...)):
    try:
        result = process_upload(
            file.file, file.filename, file.content_type, recipient_email
        )
    except UploadValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except UploadFileTooLargeError as e:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=str(e),
        )
    except UploadStorageError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        )
    except UploadDatabaseError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

    return {**result}
