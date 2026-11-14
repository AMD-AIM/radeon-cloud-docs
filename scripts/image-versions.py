#!/usr/bin/env python3
"""Fill the "Key versions" column of the stable-image tables from src/data/image-versions.json.

The JSON comes from the radeon-cloud-images release pipeline (the RC-VERSIONS line its smoke prints for every
released build); the picker descriptions use the same data. Run after updating the JSON:
    python3 scripts/image-versions.py
Only rows between <!-- image-versions:start --> and <!-- image-versions:end --> are touched; column 2 is the versions.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "src/data/image-versions.json").read_text(encoding="utf-8"))
PAGES = [ROOT / "src/content/docs/guides/images.md", ROOT / "src/content/docs/zh-cn/guides/images.md"]


def cell(name):
    v = DATA["images"].get(name, {}).get("versions", {})
    return " · ".join(f"{k} {x}" for k, x in v.items()) or "—"


def fill(text):
    def table(m):
        lines = m.group(2).split("\n")
        for i, line in enumerate(lines):
            cells = line.split("|")
            if len(cells) < 4 or set(cells[1].strip()) <= set("-: "):
                continue
            name = re.sub(r"\*\*(.+?)\*\*", r"\1", cells[1]).strip()
            if name in DATA["images"]:
                cells[2] = f" {cell(name)} "
                lines[i] = "|".join(cells)
        return m.group(1) + "\n".join(lines) + m.group(3)
    return re.sub(r"(<!-- image-versions:start -->\n)(.*?)(\n<!-- image-versions:end -->)", table, text, flags=re.S)


for page in PAGES:
    old = page.read_text(encoding="utf-8")
    new = fill(old)
    if new != old:
        page.write_text(new, encoding="utf-8")
        print(f"updated {page.relative_to(ROOT)}")
