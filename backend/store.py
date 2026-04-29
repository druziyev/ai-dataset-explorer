"""In-memory session store for uploaded datasets."""

import uuid
from typing import Any, Optional

import pandas as pd


class SessionStore:
    """Stores uploaded DataFrames keyed by session UUID."""

    def __init__(self):
        self._sessions: dict[str, dict[str, Any]] = {}

    def create_session(self, df: pd.DataFrame, filename: str) -> str:
        """Store a DataFrame and return a new session ID."""
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = {
            "df": df,
            "filename": filename,
            "chat_history": [],
        }
        return session_id

    def get_dataframe(self, session_id: str) -> Optional[pd.DataFrame]:
        """Get the DataFrame for a session."""
        session = self._sessions.get(session_id)
        return session["df"] if session else None

    def get_session(self, session_id: str) -> Optional[dict[str, Any]]:
        """Get the full session data."""
        return self._sessions.get(session_id)

    def add_chat_message(self, session_id: str, role: str, content: str):
        """Append a message to the session's chat history."""
        session = self._sessions.get(session_id)
        if session:
            session["chat_history"].append({"role": role, "content": content})

    def get_chat_history(self, session_id: str) -> list[dict]:
        """Get chat history for a session."""
        session = self._sessions.get(session_id)
        return session["chat_history"] if session else []

    def exists(self, session_id: str) -> bool:
        return session_id in self._sessions


# Global singleton
session_store = SessionStore()
