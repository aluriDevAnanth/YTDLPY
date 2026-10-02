import time
import pytest
from src.crypto import create_access_token, decode_access_token

@pytest.mark.benchmark
def test_jwt_token_generation_throughput_benchmark():
    """Profiles JWT encode throughput in ops/sec."""
    iterations = 1000
    
    start_time = time.perf_counter()
    tokens = [
        create_access_token(data={"sub": f"user_{i}", "role": "user"})
        for i in range(iterations)
    ]
    elapsed = time.perf_counter() - start_time
    ops_per_sec = iterations / elapsed
    
    assert len(tokens) == iterations
    assert ops_per_sec > 500.0  # > 500 tokens/sec target


@pytest.mark.benchmark
def test_jwt_token_verification_throughput_benchmark():
    """Profiles JWT decode and validation throughput in ops/sec."""
    iterations = 1000
    token = create_access_token(data={"sub": "bench_user_id", "role": "admin"})
    
    start_time = time.perf_counter()
    payloads = [
        decode_access_token(token)
        for _ in range(iterations)
    ]
    elapsed = time.perf_counter() - start_time
    ops_per_sec = iterations / elapsed
    
    assert all(p["sub"] == "bench_user_id" for p in payloads)
    assert ops_per_sec > 500.0  # > 500 verifications/sec target
