from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.api.v1.ml_routes import router as ml_router

app = FastAPI(title="ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ml_router, prefix="/api")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ml-service",
        "timestamp": datetime.utcnow().isoformat(),
    }
