"""Upload endpoint — accepts CSV, Excel, JSON files."""

import os

from fastapi import APIRouter, UploadFile, File, HTTPException

from config import settings
from store import session_store
from services.data_service import parse_file, clean_dataframe, get_preview, get_dataset_info

router = APIRouter()


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a dataset file and return session ID + preview."""

    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    # Read file
    contents = await file.read()

    # Validate size
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f} MB). Maximum: {settings.MAX_FILE_SIZE_MB} MB",
        )

    # Parse and clean
    try:
        df = parse_file(contents, file.filename or "data.csv")
        df = clean_dataframe(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded file contains no data.")

    # Store session
    session_id = session_store.create_session(df, file.filename or "data.csv")

    return {
        "session_id": session_id,
        "filename": file.filename,
        "info": get_dataset_info(df),
        "preview": get_preview(df),
    }
