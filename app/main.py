import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.api.upload import router as upload_router

load_dotenv()

APP_NAME = "file-transfer-system"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
)

# CORS: allow the React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": f"Welcome to {APP_NAME}!"}


@app.get("/health")
def health_check():
    return {"status": "ok", "app": APP_NAME, "environment": ENVIRONMENT}


app.include_router(upload_router, prefix="/api")
