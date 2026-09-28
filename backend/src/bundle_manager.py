# Re-export BundleManager and symbols from modular bundle package for 100% backward compatibility
from src.bundle import (
    MAGIC_HEADER,
    BundleManager,
    create_bundle,
    get_asset_stream,
    get_bundle_path,
    read_index,
)

__all__ = [
    "MAGIC_HEADER",
    "BundleManager",
    "get_bundle_path",
    "create_bundle",
    "read_index",
    "get_asset_stream",
]
