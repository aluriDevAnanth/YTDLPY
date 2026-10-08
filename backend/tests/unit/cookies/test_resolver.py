import pytest
from src.cookies.resolver import resolve_effective_cookies
from src.models import UserSettings

RESOLVER_DATASETS = [
    {"browser": b, "source": "browser"}
    for b in ["chrome", "firefox", "edge", "brave", "opera", "vivaldi", "safari", "chromium", "yandex", "auto"]
]

@pytest.mark.asyncio
@pytest.mark.parametrize("dataset", RESOLVER_DATASETS, ids=[f"res_{i}" for i in range(10)])
async def test_resolve_effective_cookies_10_datasets(dataset):
    settings = UserSettings(
        user_id="u_res_test",
        cookies_source=dataset["source"],
        cookies_browser=dataset["browser"],
    )
    res = await resolve_effective_cookies(settings)
    assert isinstance(res, dict)
    assert "source" in res
    assert "browser" in res
    assert "candidate_browsers" in res
