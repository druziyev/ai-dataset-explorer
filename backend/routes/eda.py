"""EDA endpoint — returns full exploratory data analysis."""

from fastapi import APIRouter, HTTPException

from store import session_store
from services.data_service import get_eda

router = APIRouter()


@router.get("/api/eda/{session_id}")
async def get_eda_results(session_id: str):
    """Get comprehensive EDA for an uploaded dataset."""
    df = session_store.get_dataframe(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a dataset first.")

    try:
        eda_results = get_eda(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EDA failed: {str(e)}")

    return eda_results
