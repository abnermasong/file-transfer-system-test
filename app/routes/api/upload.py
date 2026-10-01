from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.dependencies import require_authenticated_user
from app.services.upload_service import (
    UploadDatabaseError,
    UploadFileTooLargeError,
    UploadStorageError,
    UploadValidationError,
    process_upload,
)

router = APIRouter(dependencies=[Depends(require_authenticated_user)])


@router.post("/upload")
def upload_file(
    recipient_email: Annotated[str, Form()], file: Annotated[UploadFile, File()]
):
    try:
        result = process_upload(
            file.file, file.filename, file.content_type, recipient_email
        )
    except UploadValidationError as validation_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(validation_error),
        ) from validation_error
    except UploadFileTooLargeError as file_size_error:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=str(file_size_error),
        ) from file_size_error
    except UploadStorageError as storage_error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(storage_error),
        ) from storage_error
    except UploadDatabaseError as database_error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(database_error),
        ) from database_error

    return {**result}
