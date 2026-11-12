import re
from pathlib import Path

root_dir = Path("frontend/src/pages/components")
for f in root_dir.glob("*.tsx"):
    txt = f.read_text(encoding="utf-8")
    if len(txt) < 300 and "import {" in txt and "export default" in txt:
        match = re.search(r"import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+[\'\"]([^\'\"]+)[\'\"]", txt)
        if match:
            comp_name, path = match.groups()
            new_txt = f'export {{\n  {comp_name} as default,\n  {comp_name},\n}} from "{path}";\n'
            f.write_text(new_txt, encoding="utf-8")
            print(f"Updated {f.name}")
