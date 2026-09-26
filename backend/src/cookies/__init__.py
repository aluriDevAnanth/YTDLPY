"""Browser cookie manager module exporting detection, availability and resolver functions."""

from src.cookies.detector import (
    SUPPORTED_BROWSERS_DEF,
    detect_installed_browsers,
    get_available_browsers,
    get_installed_browser_ids,
    initialize_browser_detection,
)
from src.cookies.resolver import (
    get_admin_cookie_settings,
    resolve_effective_cookies,
)

__all__ = [
    "SUPPORTED_BROWSERS_DEF",
    "detect_installed_browsers",
    "initialize_browser_detection",
    "get_available_browsers",
    "get_installed_browser_ids",
    "get_admin_cookie_settings",
    "resolve_effective_cookies",
]
