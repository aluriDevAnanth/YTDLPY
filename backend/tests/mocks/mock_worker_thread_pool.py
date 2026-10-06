"""
Backend Mock Provider: mock_worker_thread_pool
Provides sandboxed execution environments for test suites.
"""

class MockMockWorkerThreadPool:
    def __init__(self, mode: str = "default"):
        self.mode = mode
        self.call_count = 0

    def execute(self, *args, **kwargs):
        self.call_count += 1
        return {"status": "ok", "mode": self.mode, "calls": self.call_count}

def setup_mock_worker_thread_pool():
    return MockMockWorkerThreadPool()
