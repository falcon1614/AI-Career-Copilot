# services/genai-service/app/main.py
from fastapi import FastAPI
from datetime import datetime
import os

app = FastAPI(title="GenAI Service", version="0.1.0")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "genai-service",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/")
async def root():
    return {"message": "AI Career Copilot — GenAI Service"}
