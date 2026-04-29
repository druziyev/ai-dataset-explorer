"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import upload, eda, charts, chat

app = FastAPI(
    title="AI Dataset Explorer",
    description="Upload datasets and get AI-powered analysis",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(upload.router)
app.include_router(eda.router)
app.include_router(charts.router)
app.include_router(chat.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "AI Dataset Explorer is running"}
