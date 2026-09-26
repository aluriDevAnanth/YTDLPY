"""Browser detection and profile discovery across Windows, Linux, and macOS."""

import os
import sys
from pathlib import Path
from typing import Dict, List
from src.logger import log_info, log_success, log_warning

# In-memory cached detected browsers
_DETECTED_BROWSERS: List[Dict] = []
_INSTALLED_BROWSER_IDS: List[str] = []

SUPPORTED_BROWSERS_DEF = [
    {
        "id": "firefox",
        "name": "Mozilla Firefox",
        "icon": "logos:firefox",
        "win_paths": [
            os.path.expandvars(r"%APPDATA%\Mozilla\Firefox\Profiles"),
            os.path.expandvars(r"%PROGRAMFILES%\Mozilla Firefox\firefox.exe"),
            os.path.expandvars(r"%PROGRAMFILES(X86)%\Mozilla Firefox\firefox.exe"),
        ],
        "linux_paths": ["~/.mozilla/firefox", "/usr/bin/firefox"],
        "mac_paths": ["~/Library/Application Support/Firefox/Profiles", "/Applications/Firefox.app"],
    },
    {
        "id": "brave",
        "name": "Brave Browser",
        "icon": "logos:brave",
        "win_paths": [
            os.path.expandvars(r"%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data"),
            os.path.expandvars(r"%PROGRAMFILES%\BraveSoftware\Brave-Browser\Application\brave.exe"),
        ],
        "linux_paths": ["~/.config/BraveSoftware/Brave-Browser", "/usr/bin/brave-browser"],
        "mac_paths": ["~/Library/Application Support/BraveSoftware/Brave-Browser", "/Applications/Brave Browser.app"],
    },
    {
        "id": "chrome",
        "name": "Google Chrome",
        "icon": "logos:chrome",
        "win_paths": [
            os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data"),
            os.path.expandvars(r"%PROGRAMFILES%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe"),
        ],
        "linux_paths": ["~/.config/google-chrome", "/usr/bin/google-chrome"],
        "mac_paths": ["~/Library/Application Support/Google/Chrome", "/Applications/Google Chrome.app"],
    },
    {
        "id": "edge",
        "name": "Microsoft Edge",
        "icon": "logos:microsoft-edge",
        "win_paths": [
            os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\User Data"),
            os.path.expandvars(r"%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe"),
        ],
        "linux_paths": ["~/.config/microsoft-edge", "/usr/bin/microsoft-edge"],
        "mac_paths": ["~/Library/Application Support/Microsoft Edge", "/Applications/Microsoft Edge.app"],
    },
    {
        "id": "opera",
        "name": "Opera",
        "icon": "logos:opera",
        "win_paths": [
            os.path.expandvars(r"%APPDATA%\Opera Software\Opera Stable"),
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\Opera\opera.exe"),
        ],
        "linux_paths": ["~/.config/opera", "/usr/bin/opera"],
        "mac_paths": ["~/Library/Application Support/com.operasoftware.Opera", "/Applications/Opera.app"],
    },
    {
        "id": "opera-gx",
        "name": "Opera GX",
        "icon": "simple-icons:operagx",
        "win_paths": [
            os.path.expandvars(r"%APPDATA%\Opera Software\Opera GX Stable"),
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\Opera GX\opera.exe"),
        ],
        "linux_paths": [],
        "mac_paths": [],
    },
    {
        "id": "vivaldi",
        "name": "Vivaldi",
        "icon": "logos:vivaldi-icon",
        "win_paths": [
            os.path.expandvars(r"%LOCALAPPDATA%\Vivaldi\User Data"),
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\Vivaldi\Application\vivaldi.exe"),
        ],
        "linux_paths": ["~/.config/vivaldi", "/usr/bin/vivaldi"],
        "mac_paths": ["~/Library/Application Support/Vivaldi", "/Applications/Vivaldi.app"],
    },
    {
        "id": "zen",
        "name": "Zen Browser",
        "icon": "simple-icons:firefoxbrowser",
        "win_paths": [
            os.path.expandvars(r"%APPDATA%\zen\Profiles"),
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\zen\zen.exe"),
        ],
        "linux_paths": ["~/.zen"],
        "mac_paths": ["~/Library/Application Support/zen"],
    },
    {
        "id": "floorp",
        "name": "Floorp",
        "icon": "simple-icons:firefoxbrowser",
        "win_paths": [
            os.path.expandvars(r"%APPDATA%\Floorp\Profiles"),
        ],
        "linux_paths": ["~/.floorp"],
        "mac_paths": ["~/Library/Application Support/Floorp"],
    },
    {
        "id": "chromium",
        "name": "Chromium",
        "icon": "logos:chromium",
        "win_paths": [
            os.path.expandvars(r"%LOCALAPPDATA%\Chromium\User Data"),
        ],
        "linux_paths": ["~/.config/chromium", "/usr/bin/chromium"],
        "mac_paths": ["~/Library/Application Support/Chromium"],
    },
    {
        "id": "safari",
        "name": "Safari",
        "icon": "logos:safari",
        "win_paths": [],
        "linux_paths": [],
        "mac_paths": ["~/Library/Safari"],
    },
]


def _find_profiles_for_browser(browser_id: str) -> List[str]:
    """Find known user profile names for a detected browser."""
    profiles = ["Default"]
    try:
        if sys.platform == "win32":
            if browser_id in ["chrome", "edge", "brave", "vivaldi", "chromium"]:
                base_dir = None
                if browser_id == "chrome":
                    base_dir = Path(os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data"))
                elif browser_id == "edge":
                    base_dir = Path(os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\User Data"))
                elif browser_id == "brave":
                    base_dir = Path(os.path.expandvars(r"%LOCALAPPDATA%\BraveSoftware\Brave-Browser\User Data"))
                elif browser_id == "vivaldi":
                    base_dir = Path(os.path.expandvars(r"%LOCALAPPDATA%\Vivaldi\User Data"))
                elif browser_id == "chromium":
                    base_dir = Path(os.path.expandvars(r"%LOCALAPPDATA%\Chromium\User Data"))

                if base_dir and base_dir.exists() and base_dir.is_dir():
                    found = []
                    if (base_dir / "Default").exists():
                        found.append("Default")
                    for p in base_dir.glob("Profile *"):
                        if p.is_dir():
                            found.append(p.name)
                    if found:
                        profiles = found
            elif browser_id in ["firefox", "zen", "floorp"]:
                base_dir = None
                if browser_id == "firefox":
                    base_dir = Path(os.path.expandvars(r"%APPDATA%\Mozilla\Firefox\Profiles"))
                elif browser_id == "zen":
                    base_dir = Path(os.path.expandvars(r"%APPDATA%\zen\Profiles"))
                elif browser_id == "floorp":
                    base_dir = Path(os.path.expandvars(r"%APPDATA%\Floorp\Profiles"))

                if base_dir and base_dir.exists() and base_dir.is_dir():
                    found = [p.name for p in base_dir.iterdir() if p.is_dir()]
                    if found:
                        profiles = found
    except Exception:
        pass
    return profiles


def detect_installed_browsers() -> List[Dict]:
    """Scans OS directories for installed browsers before the application serves requests."""
    global _DETECTED_BROWSERS, _INSTALLED_BROWSER_IDS
    detected = []
    installed_ids = []

    for b in SUPPORTED_BROWSERS_DEF:
        is_installed = False
        paths_to_check = []
        if sys.platform == "win32":
            paths_to_check = b["win_paths"]
        elif sys.platform == "darwin":
            paths_to_check = [os.path.expanduser(p) for p in b["mac_paths"]]
        else:
            paths_to_check = [os.path.expanduser(p) for p in b["linux_paths"]]

        for p_str in paths_to_check:
            if not p_str:
                continue
            p = Path(p_str)
            if p.exists():
                is_installed = True
                break

        profiles = _find_profiles_for_browser(b["id"]) if is_installed else ["Default"]
        supported = is_installed
        status_msg = "Not installed"
        cookie_count = 0

        if is_installed:
            import yt_dlp.cookies
            try:
                jar = yt_dlp.cookies.extract_cookies_from_browser(b["id"])
                cookie_count = len(jar) if jar else 0
                supported = True
                status_msg = f"Available ({cookie_count} cookies)"
            except Exception as exc:
                err = str(exc).lower()
                if "dpapi" in err or "decrypt" in err:
                    supported = False
                    status_msg = "DPAPI Protected (Use Firefox or upload cookies.txt)"
                else:
                    supported = True
                    status_msg = "Available"

        if is_installed and supported:
            installed_ids.append(b["id"])

        detected.append({
            "id": b["id"],
            "name": b["name"],
            "icon": b["icon"],
            "installed": is_installed,
            "supported": supported,
            "status_msg": status_msg,
            "cookie_count": cookie_count,
            "profiles": profiles,
        })

    _DETECTED_BROWSERS = detected
    _INSTALLED_BROWSER_IDS = installed_ids
    return detected


def initialize_browser_detection():
    """Startup initialization method called during FastAPI lifespan."""
    log_info("🔍 Pre-startup: Scanning installed browsers for cookie extraction...")
    browsers = detect_installed_browsers()
    installed = [b["name"] for b in browsers if b["installed"]]
    if installed:
        log_success(f"🌐 Found {len(installed)} installed browsers: {', '.join(installed)}")
    else:
        log_warning("⚠️ No standard browser profiles detected on host system.")


def get_available_browsers() -> List[Dict]:
    """Returns detected and supported browsers with install status."""
    global _DETECTED_BROWSERS
    if not _DETECTED_BROWSERS:
        detect_installed_browsers()
    return _DETECTED_BROWSERS


def get_installed_browser_ids() -> List[str]:
    """Returns list of browser IDs installed on the host."""
    global _INSTALLED_BROWSER_IDS
    if not _INSTALLED_BROWSER_IDS:
        detect_installed_browsers()
    return _INSTALLED_BROWSER_IDS
