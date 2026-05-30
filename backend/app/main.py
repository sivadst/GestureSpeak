"""GestureSpeak Backend - FastAPI Application"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import init_db
from app.routers import auth, gestures, websocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    print("[GestureSpeak] Database initialized")
    print(f"[GestureSpeak] Environment: {settings.ENVIRONMENT}")
    yield
    # Shutdown
    print("[GestureSpeak] Shutting down")


app = FastAPI(
    title="GestureSpeak API",
    description="AI-powered real-time sign language communication platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(gestures.router)
app.include_router(websocket.router)


@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "GestureSpeak API", "version": "1.0.0"}
