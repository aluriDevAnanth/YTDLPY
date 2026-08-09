import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn

from src.db import init_db
from src.ffmpeg_manager import ensure_ffmpeg_installed
from src.VideoDownloader import resume_uncompleted_downloads
from src.sio import sio
from src.logger import log_info, log_success
from src.routes.auth_route import router as auth_router
from src.routes.admin_route import router as admin_router
from src.routes.video_route import router as video_router
from src.routes.files_route import router as files_router
from src.routes.system_route import router as system_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    log_success("Launching YTDLP-PY-GUI Backend Services...")
    # Initialize SQLite database and bootstrap default Admin account
    await init_db()
    # Check/download FFmpeg asynchronously
    asyncio.create_task(ensure_ffmpeg_installed())
    # Resume interrupted downloads automatically on server boot
    asyncio.create_task(resume_uncompleted_downloads())
    yield
    log_info("Shutting down backend services...")

app = FastAPI(
    title="YTDLP-PY-GUI Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(video_router)
app.include_router(files_router)
app.include_router(system_router)

# Wrap FastAPI app with Socket.IO ASGI application
app_asgi = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    uvicorn.run("main:app_asgi", host="0.0.0.0", port=8000, reload=True)
