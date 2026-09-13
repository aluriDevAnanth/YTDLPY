# YTDLP-PY-GUI 🎬

> **YTDLP-PY-GUI** is a modern, high-performance full-stack video downloader, media manager, and playlist studio. It combines an asynchronous **FastAPI** backend with a sleek **React 19 + TypeScript + Vite** frontend. Under the hood, it leverages **`yt-dlp`** for video extraction, **FFmpeg** for parallel WebVTT preview sprite sheet generation, **Socket.IO** for real-time telemetry, and a custom **`.adaumc` encrypted stream bundle system** for single-file media storage.

---

## Tech Stack

This project uses high-speed, modern tooling:

- **Backend Package & Env Manager**: [`uv`](https://github.com/astral-sh/uv) (`uv sync`, `uv.lock`)
- **Frontend Runtime & Package Manager**: [`bun`](https://bun.sh/) (`bun i`, `bun run dev`, `bun.lock`)
- **Automation Scripts**: Native PowerShell (`launch.ps1`, `package_code.ps1`)

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
  - [Backend Stack (Python + uv)](#backend-stack-python--uv)
  - [Frontend Stack (React 19 + Bun + Vite)](#frontend-stack-react-19--bun--vite)
- [Custom File System & `.adaumc` Bundle Engine](#-custom-file-system---adaumc-bundle-engine)
- [Automatic FFmpeg Binary Management](#-automatic-ffmpeg-binary-management)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Quick Start](#-installation--quick-start)
  - [Option A: One-Click Launch (Recommended)](#option-a-one-click-launch-recommended)
  - [Option B: Manual Setup](#option-b-manual-setup)
- [Scripts Overview](#-scripts-overview)
- [API & WebSocket Protocol](#-api--websocket-protocol)
- [License](#-license)

---

## ✨ Key Features

1. **High-Speed Video & Audio Extraction**: Powered by `yt-dlp` with format selection (Best Video+Audio, Best Audio Only, Worst, etc.) and custom cookie support (browser extraction or custom `cookies.txt`).
2. **Real-Time Telemetry & Progress**: Socket.IO connection streams exact download percentage, speed, ETA, and state changes (queued, downloading, generating_sprites, packing_bundle, completed, paused, failed).
3. **Automatic FFmpeg Installer**: If `ffmpeg` or `ffprobe` binaries are missing from the system, the backend automatically downloads and extracts official Windows binaries into `backend/bin/` with real-time download progress events.
4. **Parallel WebVTT & Sprite Sheet Generator**: Uses CPU-bound thread allocation and parallel FFmpeg chunk processing to slice videos into 240x135 thumbnail tiles and construct WebVTT preview manifests (`preview.vtt` + `sprite_*.jpg`).
5. **Custom `.adaumc` Encrypted Stream Bundles**: Merges media files (`video.mp4`), thumbnails, WebVTT cue files, sprite sheets, and NDJSON logs into a single binary archive protected by AES-128 stream-cipher masking (`YTPY` magic header). Supports range-request streaming directly from the encrypted archive.
6. **Playlist Studio**: Interactive playlist management for creating, editing, reordering, and organizing video collections.
7. **Resumable Downloads**: Automatically detects interrupted or uncompleted downloads on backend startup and resumes them seamlessly.
8. **Secure Authentication & User Settings**: JWT bearer token authentication, bcrypt password hashing, per-user download concurrency limits, and theme preferences.
9. **One-Click Launch & Package Tooling**: Includes `launch.ps1` for launching both services simultaneously and `package_code.ps1` to sanitize caches/binaries and build clean project zip archives.

---

## 🛠️ Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │          React 19 + Vite Frontend        │
                     │ (TypeScript, PrimeReact, TailwindCSS v4) │
                     └────────────────────┬─────────────────────┘
                                          │
                         REST API (Axios) │ Socket.IO (WebSockets)
                                          │
                     ┌────────────────────▼─────────────────────┐
                     │            FastAPI Backend               │
                     │   (Python 3.10+, uv, SQLModel ORM)       │
                     └───────┬──────────────────────────┬───────┘
                             │                          │
        ┌────────────────────▼─────┐        ┌───────────▼─────────────┐
        │  yt-dlp Engine & FFmpeg  │        │ Encrypted Bundle System │
        │  Parallel Sprite Slicing │        │   (.adaumc Archives)    │
        └──────────────────────────┘        └─────────────────────────┘
```

### Backend Stack (Python + `uv`)

| Tool / Package             | Version / Detail                         | Purpose                                                             |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| **`uv`**                   | Fast Python package installer & resolver | Dependency management (`uv sync`, `uv.lock`, `pyproject.toml`)      |
| **FastAPI**                | `>=0.109.0`                              | High-performance asynchronous REST API framework                    |
| **Uvicorn**                | `>=0.27.0`                               | ASGI web server running FastAPI + Socket.IO                         |
| **`python-socketio`**      | `>=5.11.0`                               | Real-time WebSocket event broadcaster                               |
| **SQLModel & aiosqlite**   | `>=0.0.14` / `>=0.19.0`                  | Asynchronous SQLite ORM (`storage/app.db`)                          |
| **`yt-dlp`**               | `>=2024.3.10`                            | Video downloading engine                                            |
| **HTTPX**                  | `>=0.27.0`                               | Async HTTP client for downloading FFmpeg binaries                   |
| **PyCryptodome & Passlib** | Cryptography suite                       | AES-128 stream masking, JWT token handling, bcrypt password hashing |
| **Pydantic Settings**      | `>=2.0.0`                                | Environment configuration (`.env` loading)                          |
| **Rich**                   | `>=13.7.0`                               | Terminal formatting and structured log outputs                      |

### Frontend Stack (React 19 + `bun` + Vite)

| Tool / Package              | Version / Detail                    | Purpose                                                               |
| --------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| **`bun`**                   | Modern JS runtime & package manager | Fast package installation (`bun i`) and dev execution (`bun run dev`) |
| **React 19 & TypeScript**   | React `^19.1.0`, TS `~5.8.3`        | Modern component architecture and static type safety                  |
| **Vite 7**                  | `^7.0.4` with SWC plugin            | Superfast build tool and Hot Module Replacement (HMR)                 |
| **TailwindCSS v4**          | `^4.1.11`                           | Utility-first CSS styling engine                                      |
| **PrimeReact & PrimeIcons** | `^10.9.6` / `^7.0.0`                | UI component library (DataTables, Dialogs, Toasts, Buttons)           |
| **Zustand**                 | `^5.0.6`                            | Lightweight centralized state management                              |
| **React-Hook-Form & Zod**   | `^7.60.0` / `^4.0.5`                | Type-safe form handling and schema validation                         |
| **Socket.IO Client**        | `^4.8.1`                            | Real-time WebSocket connection to backend                             |
| **Vidstack React**          | `^1.12.13`                          | Custom responsive HTML5 video player component                        |

---

## 🔒 Custom File System & `.adaumc` Bundle Engine

Instead of storing raw video files loosely on disk, YTDLP-PY-GUI packs all assets of a video into a single encrypted binary container file with extension `.adaumc` inside `backend/storage/bundles/`:

- **adaumc**: `adaumc means aluri dev ananth's unified media container`
- **Magic Header**: `YTDLPY`
- **Index Header**: Encrypted JSON offset table containing byte locations of `video`, `thumbnail`, `vtt`, `vtt_sprite_*`, and `log`.
- **Payload Cipher**: Stream-cipher XOR byte-masking using `BUNDLE_ENCRYPTION_KEY_RAW`.
- **Asset Streaming**: The backend implements range-request chunk streaming (`aiofiles`), allowing instantaneous seeking inside `.adaumc` archives without unzipping to disk.

---

## ⚡ Automatic FFmpeg Binary Management

The backend automatically manages media binaries without requiring manual system PATH configurations:

1. Checks for local executables in `backend/bin/ffmpeg.exe` and `backend/bin/ffprobe.exe` (or system PATH).
2. If missing, automatically streams the latest Windows release zip from GitHub via `httpx`.
3. Emits live WebSocket progress (`startup_event`) to the UI while downloading.
4. Extracts `ffmpeg` and `ffprobe` into `backend/bin/` and deletes the zip archive.

---

## 📂 Project Directory Structure

```
YTDLPY/
├── backend/
│   ├── bin/                    # Auto-downloaded FFmpeg / FFprobe executables
│   ├── src/
│   │   ├── routes/             # API routes (auth, video, playlist, files, admin, system)
│   │   ├── VideoDownloader.py  # Main yt-dlp download & sprite generation process
│   │   ├── bundle_manager.py   # .adaumc encrypted bundle creator & streamer
│   │   ├── cleanup_worker.py   # Background cleanup for temp directories
│   │   ├── ffmpeg_manager.py   # Automatic FFmpeg downloader & path resolver
│   │   ├── config.py           # Path definitions & environment settings
│   │   ├── db.py               # Async SQLite database setup
│   │   ├── models.py           # SQLModel schemas (User, Video, Playlist, etc.)
│   │   ├── sio.py              # Socket.IO instance and broadcaster helpers
│   │   ├── crypto.py           # Encryption, hashing, and JWT utilities
│   │   └── download_logger.py  # Structured NDJSON telemetry logging
│   ├── storage/                # SQLite database (app.db) and .adaumc bundles
│   ├── main.py                 # FastAPI application entry point
│   ├── pyproject.toml          # Python project specification & dependencies
│   ├── uv.lock                 # Lockfile managed by uv
│   └── .env.example            # Environment template
├── frontend/
│   ├── src/
│   │   ├── pages/              # Pages (Home, Login, PlaylistStudio, WatchLater, ToastTesting)
│   │   │   └── components/     # UI components (Header, VideoCard, PlaylistEditor, etc.)
│   │   ├── store/              # Zustand state stores (app, video, playlist)
│   │   ├── schema.ts           # Zod validation schemas
│   │   ├── socket.ts           # Socket.IO client initialization
│   │   ├── App.tsx             # Root router & layout component
│   │   └── main.tsx            # React application entry point
│   ├── package.json            # Node.js dependencies
│   ├── bun.lock                # Lockfile managed by bun
│   ├── vite.config.ts          # Vite build & proxy configuration
│   └── index.html              # Main HTML entry point
├── launch.ps1                  # PowerShell script to launch Backend (uv) + Frontend (bun)
├── package_code.ps1            # PowerShell script to sanitize and zip project source code
└── README.md                   # Project documentation
```

---

## ⚙️ Prerequisites

- **Python**: `>= 3.10` (Python 3.12 recommended)
- **`uv`**: Installed on your system (`pip install uv` or `winget install astral-sh.uv`)
- **`bun`**: Installed on your system (`powershell -c "irm bun.sh/install.ps1 | iex"`)
- **OS**: Windows (tested with PowerShell launcher), Linux / macOS supported.

---

## 🚀 Installation & Quick Start

### Option A: One-Click Launch (Recommended)

Run the provided PowerShell launch script from the project root:

```powershell
.\launch.ps1
```

This script will:

1. Open a terminal for `backend/`, run `uv sync`, activate `.venv`, and start `python main.py`.
2. Open a terminal for `frontend/`, run `bun i`, and start `bun run dev`.
3. Open the frontend interface in your browser at `http://localhost:5173`.

---

### Option B: Manual Setup

#### 1. Backend Setup (`uv`)

```bash
cd backend

# Synchronize virtual environment & install dependencies
uv sync

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Launch the FastAPI server
python main.py
```

_The backend server runs at `http://localhost:8000`._

#### 2. Frontend Setup (`bun`)

```bash
cd frontend

# Install frontend dependencies
bun i

# Start the Vite development server
bun run dev
```

_The frontend runs at `http://localhost:5173`._

---

## 📜 Scripts Overview

### `launch.ps1`

Launches the entire full-stack application by spawning two concurrent PowerShell windows:

- **Backend window**: Executes `uv sync` to ensure dependencies are up-to-date, activates `.venv`, and runs `python main.py`.
- **Frontend window**: Executes `bun i` and starts `bun run dev`.

### `package_code.ps1`

Prepares a clean zip archive of the repository for distribution:

1. Cleans temporary build artifacts (`backend/bin`, `backend/.venv`, `backend/storage`, `frontend/node_modules`, `frontend/dist`).
2. Recursively removes all `__pycache__` directories.
3. Compresses the project source into a timestamped zip archive in the parent directory (`YTDLPY_code_YYYY-MM-DD_...zip`).

---

## 📡 API & WebSocket Protocol

### REST API Endpoints

- `POST /api/auth/register` – Register a new user account.
- `POST /api/auth/login` – Authenticate user and receive Bearer JWT.
- `GET /api/auth/me` – Fetch current user profile & preferences.
- `PUT /api/user/settings` – Update user configuration (concurrency, format, theme, cookies).
- `GET /api/videos` – Retrieve user's downloaded video catalog.
- `POST /api/videos/download` – Initiate video download task (`url`, `format`, `type`).
- `DELETE /api/videos/{id}` – Remove video record and purge associated `.adaumc` bundle.
- `GET /api/playlists` – List user playlists.
- `POST /api/playlists` – Create a new playlist.
- `PUT /api/playlists/{id}` – Edit playlist details.
- `DELETE /api/playlists/{id}` – Delete a playlist.

### WebSocket Events (`Socket.IO`)

- **`status_update`**: Emits live progress payload (`percent`, `speed`, `eta`, `downloadedSize`, `totalSize`, `downloadStatus`).
- **`video_message`**: Emits full video object state on state transitions.
- **`notify`**: Pushes toast notification messages (`success`, `error`, `info`).
- **`startup_event`**: Emits backend startup initialization progress (e.g. FFmpeg binary download status).

---
