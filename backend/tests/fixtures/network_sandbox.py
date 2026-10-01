"""
Network sandbox fixture preventing tests from inadvertently making real
external HTTP/TCP network requests (e.g. real YouTube downloads).
"""
import socket
import pytest

_orig_socket = socket.socket


class SandboxNetworkError(RuntimeError):
    pass


def guard_socket(*args, **kwargs):
    sock = _orig_socket(*args, **kwargs)
    orig_connect = sock.connect

    def safe_connect(address):
        host, port = address[0], address[1]
        # Allow internal localhost / 127.0.0.1 loopback for ASGI test client
        if host in ("127.0.0.1", "localhost", "::1", "testserver") or str(host).startswith("127."):
            return orig_connect(address)
        raise SandboxNetworkError(
            f"External network connection to {host}:{port} blocked by test network sandbox!"
        )

    sock.connect = safe_connect
    return sock


@pytest.fixture
def network_sandbox(monkeypatch):
    """Enforces network sandbox by trapping socket.socket."""
    monkeypatch.setattr(socket, "socket", guard_socket)
    yield
