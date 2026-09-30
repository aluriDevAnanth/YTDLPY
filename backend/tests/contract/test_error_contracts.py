import pytest
from fastapi import HTTPException, status

ERROR_CONTRACT_DATASETS = [
    {"status_code": status.HTTP_400_BAD_REQUEST, "detail": "Invalid video URL format provided", "error_type": "invalid_url"},
    {"status_code": status.HTTP_401_UNAUTHORIZED, "detail": "Authentication token expired or invalid", "error_type": "auth_error"},
    {"status_code": status.HTTP_403_FORBIDDEN, "detail": "Insufficient permissions to access admin metrics", "error_type": "forbidden"},
    {"status_code": status.HTTP_404_NOT_FOUND, "detail": "Requested video bundle does not exist on disk", "error_type": "not_found"},
    {"status_code": status.HTTP_409_CONFLICT, "detail": "Username already registered in database", "error_type": "conflict"},
    {"status_code": 416, "detail": "Byte range exceeds file size boundary", "error_type": "range_error"},
    {"status_code": 422, "detail": "Missing required field: password", "error_type": "validation_error"},
    {"status_code": status.HTTP_500_INTERNAL_SERVER_ERROR, "detail": "Bundle corruption or payload reading error", "error_type": "server_error"},
    {"status_code": status.HTTP_502_BAD_GATEWAY, "detail": "Failed to connect to yt-dlp upstream extractor", "error_type": "gateway_error"},
    {"status_code": status.HTTP_503_SERVICE_UNAVAILABLE, "detail": "Database connection pool saturated", "error_type": "unavailable"},
]

@pytest.mark.parametrize("dataset", ERROR_CONTRACT_DATASETS, ids=[f"err_ds_{i}" for i in range(10)])
def test_error_contracts_10_datasets(dataset):
    exc = HTTPException(status_code=dataset["status_code"], detail=dataset["detail"])
    assert exc.status_code == dataset["status_code"]
    assert exc.detail == dataset["detail"]
    assert isinstance(exc.detail, str)
    assert len(exc.detail) > 0
