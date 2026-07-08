# services/ml-service/app/main.py
from fastapi import FastAPI
from datetime import datetime

app = FastAPI(title="ML Service", version="0.1.0")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ml-service",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/")
async def root():
    return {"message": "AI Career Copilot — ML Service"}
