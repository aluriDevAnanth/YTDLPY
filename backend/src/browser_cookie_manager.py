"""Browser cookie manager facade exporting submodules for backward compatibility."""

from src.cookies import (
    SUPPORTED_BROWSERS_DEF,
    detect_installed_browsers,
    get_admin_cookie_settings,
    get_available_browsers,
    get_installed_browser_ids,
    initialize_browser_detection,
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
