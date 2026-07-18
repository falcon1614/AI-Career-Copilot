from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from app.api.v1.resume_routes import router as resume_router
from app.api.v1.interview_routes import router as interview_router

app = FastAPI(title="GenAI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router,   prefix="/api")
app.include_router(interview_router, prefix="/api")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "genai-service",
        "model": "gemini-1.5-flash",
        "timestamp": datetime.utcnow().isoformat(),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
    }


@app.get("/")
async def root():
    return {"message": "AI Career Copilot — GenAI Service"}
