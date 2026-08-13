import socketio
from src.crypto import decode_access_token

sio = socketio.AsyncServer(
    async_mode="asgi", cors_allowed_origins="*", logger=False, engineio_logger=False
)
sid_user_map = {}


@sio.event
async def connect(sid, environ, auth=None):
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get("token")
    if not token:
        query_string = environ.get("QUERY_STRING", "")
        for param in query_string.split("&"):
            if param.startswith("token="):
                token = param.split("=")[1]
                break
    user_id = None
    role = None
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")
            role = payload.get("role")
    if not user_id:
        raise ConnectionRefusedError("Authentication token missing or invalid")
    sid_user_map[sid] = user_id
    room = f"user_{user_id}"
    await sio.enter_room(sid, room)
    if role == "admin":
        await sio.enter_room(sid, "admin_room")
    await sio.emit(
        "startupp",
        {
            "sseType": "startupp",
            "dataID": "startupp",
            "message": "Backend operational",
            "typee": "success",
        },
        room=sid,
    )


@sio.event
async def disconnect(sid):
    if sid in sid_user_map:
        del sid_user_map[sid]


async def send_startup_event(
    message: str,
    typee: str = "ongoing",
    user_id: str = None,
    sid: str = None,
    progress: dict = None,
):
    data = {
        "sseType": "startupp",
        "dataID": "startupp",
        "message": message,
        "typee": typee,
        "progress": progress,
    }
    if sid:
        await sio.emit("startupp", data, room=sid)
    elif user_id:
        await sio.emit("startupp", data, room=f"user_{user_id}")
    else:
        await sio.emit("startupp", data)


async def send_status_update(progress: dict, user_id: str = None):
    if user_id:
        await sio.emit("status_update", progress, room=f"user_{user_id}")
    else:
        await sio.emit("status_update", progress)


async def send_video_message(video_dict: dict, user_id: str = None):
    if user_id:
        await sio.emit("message", video_dict, room=f"user_{user_id}")
    else:
        await sio.emit("message", video_dict)


async def send_remove_video(video_id: str, user_id: str = None):
    if user_id:
        await sio.emit("remove_video", video_id, room=f"user_{user_id}")
    else:
        await sio.emit("remove_video", video_id)


async def send_notify(severity: str, summary: str, detail: str, user_id: str = None):
    data = {"severity": severity, "summary": summary, "detail": detail, "extraData": {}}
    if user_id:
        await sio.emit("notify", data, room=f"user_{user_id}")
    else:
        await sio.emit("notify", data)


async def send_admin_event(event_name: str = "admin_stats_update", data: dict = None):
    await sio.emit(event_name, data or {}, room="admin_room")
