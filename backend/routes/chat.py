"""Chat endpoint — SSE streaming AI responses about the dataset."""

import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from store import session_store
from services.ai_service import stream_agent_response

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/api/chat/{session_id}")
async def chat_with_data(session_id: str, body: ChatRequest):
    """Chat with the dataset using LangChain agent — streams via SSE."""
    df = session_store.get_dataframe(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a dataset first.")

    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Store user message
    session_store.add_chat_message(session_id, "user", body.message)

    async def event_generator():
        full_response = ""
        try:
            async for token in stream_agent_response(df, body.message):
                full_response += token
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'token': f'Error: {str(e)}'})}\n\n"

        # Store assistant response
        session_store.add_chat_message(session_id, "assistant", full_response)
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
