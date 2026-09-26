"""Active download registry and thread concurrency controls."""

import asyncio
import os
import threading
from typing import Dict


class ActiveDownloadRegistry:
    """Manages active, paused, and cancelled state of concurrent video downloads."""

    def __init__(self):
        self._active: Dict[str, bool] = {}
        self._paused: Dict[str, bool] = {}
        self._unpause_events: Dict[str, threading.Event] = {}
        self._lock = threading.Lock()

    def register(self, video_id: str):
        with self._lock:
            self._active[video_id] = True
            self._paused[video_id] = False
            ev = self._unpause_events.get(video_id)
            if not ev:
                ev = threading.Event()
                self._unpause_events[video_id] = ev
            ev.set()

    def cancel(self, video_id: str):
        with self._lock:
            self._active[video_id] = False
            self._paused[video_id] = False
            ev = self._unpause_events.get(video_id)
            if ev:
                ev.set()

    def pause(self, video_id: str):
        with self._lock:
            self._paused[video_id] = True
            ev = self._unpause_events.get(video_id)
            if not ev:
                ev = threading.Event()
                self._unpause_events[video_id] = ev
            ev.clear()

    def resume(self, video_id: str):
        with self._lock:
            self._paused[video_id] = False
            ev = self._unpause_events.get(video_id)
            if ev:
                ev.set()

    def is_active(self, video_id: str) -> bool:
        with self._lock:
            return self._active.get(video_id, False)

    def is_paused(self, video_id: str) -> bool:
        with self._lock:
            return self._paused.get(video_id, False)

    def wait_if_paused(self, video_id: str, timeout: float = 1.0) -> bool:
        """Blocks while paused until resumed or cancelled. Returns False if cancelled/inactive."""
        while self.is_active(video_id) and self.is_paused(video_id):
            ev = self._unpause_events.get(video_id)
            if ev:
                ev.wait(timeout=timeout)
        return self.is_active(video_id)

    def unregister(self, video_id: str):
        with self._lock:
            self._active.pop(video_id, None)
            self._paused.pop(video_id, None)
            ev = self._unpause_events.pop(video_id, None)
            if ev:
                ev.set()


download_registry = ActiveDownloadRegistry()
CPU_COUNT = os.cpu_count() or 4
GLOBAL_SEMAPHORE_LIMIT = CPU_COUNT * 2
GLOBAL_SPRITE_SEMAPHORE = asyncio.Semaphore(GLOBAL_SEMAPHORE_LIMIT)


def get_optimal_thread_count(duration_mins: float) -> int:
    """Calculate the ideal number of threads for FFmpeg sprite extraction based on video length."""
    if duration_mins < 5:
        return 1
    if duration_mins < 15:
        return 2
    if duration_mins < 30:
        return 4
    max_cap = min(8, CPU_COUNT)
    return max(4, max_cap)
