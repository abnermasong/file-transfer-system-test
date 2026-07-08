import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

APP_NAME = "file-transfer-system"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app = FastAPI(title=APP_NAME)

# CORS: allow the React frontend (Vite dev server / deployed origin) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Simple connectivity check used to confirm React <-> FastAPI wiring (Phase 0)."""
    return {"status": "ok", "app": APP_NAME, "environment": ENVIRONMENT}
