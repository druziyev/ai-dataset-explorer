"""Charts endpoint — returns auto-generated Plotly chart data."""

from fastapi import APIRouter, HTTPException

from store import session_store
from services.chart_service import generate_charts

router = APIRouter()


@router.get("/api/charts/{session_id}")
async def get_charts(session_id: str):
    """Generate and return interactive charts for the dataset."""
    df = session_store.get_dataframe(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a dataset first.")

    try:
        charts = generate_charts(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chart generation failed: {str(e)}")

    return {"charts": charts}
