"""
Backend Mock Provider: mock_network_socket_guard
Provides sandboxed execution environments for test suites.
"""

class MockMockNetworkSocketGuard:
    def __init__(self, mode: str = "default"):
        self.mode = mode
        self.call_count = 0

    def execute(self, *args, **kwargs):
        self.call_count += 1
        return {"status": "ok", "mode": self.mode, "calls": self.call_count}

def setup_mock_network_socket_guard():
    return MockMockNetworkSocketGuard()
