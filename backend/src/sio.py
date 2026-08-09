import socketio
from src.crypto import decode_access_token

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

# Active connections map sid -> user_id
sid_user_map = {}

@sio.event
async def connect(sid, environ, auth=None):
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get("token")
    if not token:
        # Check query string params or headers if needed
        query_string = environ.get("QUERY_STRING", "")
        for param in query_string.split("&"):
            if param.startswith("token="):
                token = param.split("=")[1]
                break

    user_id = None
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")

    if user_id:
        sid_user_map[sid] = user_id
        room = f"user_{user_id}"
        await sio.enter_room(sid, room)
    
    # Emit initial startup success handshake
    await sio.emit("startupp", {
        "sseType": "startupp",
        "dataID": "startupp",
        "message": "Backend operational",
        "typee": "success"
    }, room=sid)

@sio.event
async def disconnect(sid):
    if sid in sid_user_map:
        del sid_user_map[sid]

async def send_startup_event(message: str, typee: str = "ongoing", user_id: str = None, sid: str = None):
    data = {
        "sseType": "startupp",
        "dataID": "startupp",
        "message": message,
        "typee": typee
    }
    if sid:
        await sio.emit("startupp", data, room=sid)
    elif user_id:
        await sio.emit("startupp", data, room=f"user_{user_id}")
    else:
        await sio.emit("startupp", data)

async def send_status_update(progress: dict, user_id: str):
    await sio.emit("status_update", progress, room=f"user_{user_id}")

async def send_video_message(video_dict: dict, user_id: str):
    await sio.emit("message", video_dict, room=f"user_{user_id}")

async def send_remove_video(video_id: str, user_id: str):
    await sio.emit("remove_video", video_id, room=f"user_{user_id}")

async def send_notify(severity: str, summary: str, detail: str, user_id: str):
    await sio.emit("notify", {
        "severity": severity,
        "summary": summary,
        "detail": detail,
        "extraData": {}
    }, room=f"user_{user_id}")
