import os
from pathlib import Path

import os
from pathlib import Path

def audit_workspace(root_dir: Path):
    categories = {
        "frontend_components": 0,
        "frontend_stores_hooks_utils": 0,
        "frontend_unit_tests": 0,
        "frontend_integration_tests": 0,
        "frontend_benchmarks": 0,
        "frontend_fixtures_mocks": 0,
        "backend_source": 0,
        "backend_unit_tests": 0,
        "backend_algo_tests": 0,
        "backend_integration_tests": 0,
        "backend_benchmarks": 0,
        "backend_fixtures_mocks": 0,
        "root_e2e_tests": 0,
        "root_contract_tests": 0,
        "root_event_tests": 0,
        "root_load_benchmarks": 0,
        "root_harnesses_common": 0,
        "configs_docs_scripts": 0,
        "total_files": 0,
    }

    ignore_dirs = {".git", "node_modules", ".venv", "__pycache__", "dist", ".pytest_cache", ".coverage"}

    all_files = []
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for f in files:
            file_path = Path(root) / f
            rel_path = file_path.relative_to(root_dir).as_posix()
            all_files.append(rel_path)

            if rel_path.startswith("frontend/src/"):
                if f.endswith(".tsx"):
                    categories["frontend_components"] += 1
                else:
                    categories["frontend_stores_hooks_utils"] += 1
            elif rel_path.startswith("frontend/tests/unit/"):
                categories["frontend_unit_tests"] += 1
            elif rel_path.startswith("frontend/tests/integration/"):
                categories["frontend_integration_tests"] += 1
            elif rel_path.startswith("frontend/tests/benchmarks/"):
                categories["frontend_benchmarks"] += 1
            elif rel_path.startswith("frontend/tests/fixtures/") or rel_path.startswith("frontend/tests/mocks/"):
                categories["frontend_fixtures_mocks"] += 1
            elif rel_path.startswith("frontend/tests/"):
                categories["frontend_fixtures_mocks"] += 1
            elif rel_path.startswith("backend/src/"):
                categories["backend_source"] += 1
            elif rel_path.startswith("backend/tests/unit/algorithms/"):
                categories["backend_algo_tests"] += 1
            elif rel_path.startswith("backend/tests/unit/"):
                categories["backend_unit_tests"] += 1
            elif rel_path.startswith("backend/tests/integration/"):
                categories["backend_integration_tests"] += 1
            elif rel_path.startswith("backend/tests/benchmarks/"):
                categories["backend_benchmarks"] += 1
            elif rel_path.startswith("backend/tests/fixtures/") or rel_path.startswith("backend/tests/mocks/"):
                categories["backend_fixtures_mocks"] += 1
            elif rel_path.startswith("backend/tests/"):
                categories["backend_fixtures_mocks"] += 1
            elif rel_path.startswith("tests/e2e/"):
                categories["root_e2e_tests"] += 1
            elif rel_path.startswith("tests/contracts/"):
                categories["root_contract_tests"] += 1
            elif rel_path.startswith("tests/events/"):
                categories["root_event_tests"] += 1
            elif rel_path.startswith("tests/benchmark/"):
                categories["root_load_benchmarks"] += 1
            elif rel_path.startswith("tests/harnesses/") or rel_path.startswith("tests/common/"):
                categories["root_harnesses_common"] += 1
            else:
                categories["configs_docs_scripts"] += 1

    categories["total_files"] = len(all_files)
    return categories

if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    results = audit_workspace(root)
    print("=== WORKSPACE FILE AUDIT & ARCHITECTURE BREAKDOWN ===")
    for k, v in results.items():
        print(f"  {k:35}: {v:5}")

