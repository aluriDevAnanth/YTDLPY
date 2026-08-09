import asyncio
import os
import subprocess
import sys

from fastapi import APIRouter
from src.logger import log_error, log_info

router = APIRouter(prefix="/api", tags=["System"])


@router.post("/restart")
async def restart_backend():
    """Trigger clean backend process reboot."""
    log_info("🔄 Backend restart sequence triggered by frontend.")

    async def do_restart():
        await asyncio.sleep(0.8)
        try:
            executable = sys.executable
            args = [executable] + sys.argv
            log_info(
                "🚀 Launching new backend process and terminating current instance..."
            )
            subprocess.Popen(args, close_fds=True)
        except Exception as e:
            log_error("Failed to spawn reboot process", e)
        finally:
            os._exit(0)

    asyncio.create_task(do_restart())
    return {"status": "restarting", "message": "Backend server is rebooting"}
