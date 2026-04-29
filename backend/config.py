import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: set = {".csv", ".xlsx", ".xls", ".json"}
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
