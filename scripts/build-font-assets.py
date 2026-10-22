#!/usr/bin/env python3
"""Compile licensed Arabic typefaces into standalone SVG glyph path data.

HarfBuzz performs actual Arabic OpenType shaping for isolated/final/initial/medial
forms. FontTools then extracts the selected glyph outlines as Bézier path data.
No browser font rendering or runtime font download is needed.
"""
from __future__ import annotations

import io
import json
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src" / "generated" / "font-styles.js"
FORMS = ("isolated", "final", "initial", "medial")
LETTERS = (
    ("ا", (0, 1, None, None)),
    ("ب", (0, 1, 2, 3)),
    ("ت", (0, 1, 2, 3)),
    ("ث", (0, 1, 2, 3)),
    ("ج", (0, 1, 2, 3)),
    ("ح", (0, 1, 2, 3)),
    ("خ", (0, 1, 2, 3)),
    ("د", (0, 1, None, None)),
    ("ذ", (0, 1, None, None)),
    ("ر", (0, 1, None, None)),
    ("ز", (0, 1, None, None)),
    ("س", (0, 1, 2, 3)),
    ("ش", (0, 1, 2, 3)),
    ("ص", (0, 1, 2, 3)),
    ("ض", (0, 1, 2, 3)),
    ("ط", (0, 1, 2, 3)),
    ("ظ", (0, 1, 2, 3)),
    ("ع", (0, 1, 2, 3)),
    ("غ", (0, 1, 2, 3)),
    ("ف", (0, 1, 2, 3)),
    ("ق", (0, 1, 2, 3)),
    ("ك", (0, 1, 2, 3)),
    ("ل", (0, 1, 2, 3)),
    ("م", (0, 1, 2, 3)),
    ("ن", (0, 1, 2, 3)),
    ("ه", (0, 1, 2, 3)),
    ("و", (0, 1, None, None)),
    ("ي", (0, 1, 2, 3)),
)
FONTS = (
    ("aref", "Aref Ruqaa", "vendor-fonts/ArefRuqaa-Regular.ttf", "https://github.com/google/fonts/tree/main/ofl/arefruqaa", None),
    ("reemkufi", "Reem Kufi Bold", "vendor-fonts/ReemKufi-VF.ttf", "https://github.com/google/fonts/tree/main/ofl/reemkufi", {"wght": 700}),
    ("rakkas", "Rakkas", "vendor-fonts/Rakkas-Regular.ttf", "https://github.com/google/fonts/tree/main/ofl/rakkas", None),
    ("katibeh", "Katibeh", "vendor-fonts/Katibeh-Regular.ttf", "https://github.com/google/fonts/tree/main/ofl/katibeh", None),
    ("lateef", "Lateef", "vendor-fonts/Lateef-Regular.ttf", "https://github.com/google/fonts/tree/main/ofl/lateef", None),
    ("scheherazade", "Scheherazade New", "vendor-fonts/ScheherazadeNew-Regular.ttf", "https://github.com/google/fonts/tree/main/ofl/scheherazadenew", None),
)


def make_harfbuzz_font(font: TTFont) -> hb.Font:
    buffer = io.BytesIO()
    font.save(buffer)
    face = hb.Face(buffer.getvalue())
    hb_font = hb.Font(face)
    hb.ot_font_set_funcs(hb_font)
    units = int(font["head"].unitsPerEm)
    hb_font.scale = (units, units)
    return hb_font


def shaped_records(hb_font: hb.Font, characters: list[str]):
    buffer = hb.Buffer()
    buffer.add_codepoints([ord(ch) for ch in characters])
    buffer.direction = "rtl"
    buffer.script = "Arab"
    buffer.language = "ar"
    hb.shape(hb_font, buffer, {})
    records = []
    pen_x = 0
    pen_y = 0
    for info, position in zip(buffer.glyph_infos, buffer.glyph_positions, strict=True):
        records.append({
            "gid": int(info.codepoint),
            "cluster": int(info.cluster),
            "pen_x": pen_x,
            "pen_y": pen_y,
            "x_offset": int(position.x_offset),
            "y_offset": int(position.y_offset),
            "x_advance": int(position.x_advance),
            "y_advance": int(position.y_advance),
        })
        pen_x += int(position.x_advance)
        pen_y += int(position.y_advance)
    return records


def outline_asset(font: TTFont, records: list[dict], label: str, cluster_filter: set[int]) -> dict | None:
    selected = [item for item in records if item["cluster"] in cluster_filter]
    if not selected:
        return None
    # Do not invent a lam-alef ligature if the typeface shaped it as two independent letters.
    if "lam-alef" in label and len({item["cluster"] for item in selected}) != 1:
        return None

    glyph_order = font.getGlyphOrder()
    glyph_set = font.getGlyphSet()
    first_pen_x = selected[0]["pen_x"]
    first_pen_y = selected[0]["pen_y"]
    path_pen = SVGPathPen(glyph_set)
    bounds_pen = BoundsPen(glyph_set)
    advance = 0

    for item in selected:
        glyph_name = glyph_order[item["gid"]]
        dx = item["pen_x"] - first_pen_x + item["x_offset"]
        dy = item["pen_y"] - first_pen_y + item["y_offset"]
        glyph = glyph_set[glyph_name]
        glyph.draw(TransformPen(path_pen, (1, 0, 0, 1, dx, dy)))
        glyph.draw(TransformPen(bounds_pen, (1, 0, 0, 1, dx, dy)))
        advance += item["x_advance"]

    bounds = bounds_pen.bounds
    if bounds is None:
        return None
    return {
        "path": path_pen.getCommands(),
        "advance": round(abs(float(advance)), 3),
        "bounds": [round(float(value), 3) for value in bounds],
        "source": label,
    }


def glyph_for_form(font: TTFont, hb_font: hb.Font, letter: str, form: str) -> dict:
    # Display faces may replace a letter together with a neighboring letter via
    # contextual GSUB. Try several joining contexts and keep a sample where the
    # target retains its own HarfBuzz cluster, so a neighboring letter is never
    # accidentally baked into this glyph's outline.
    contexts = ("ب", "ت", "ن", "م", "س", "ل", "ي", "ف", "ك", "ق", "ح", "ج", "ش", "ص", "ع", "غ", "ث", "ض")
    trials = (None,) if form == "isolated" else contexts
    for context in trials:
        if form == "isolated":
            sample, target = [letter], 0
        elif form == "final":
            sample, target = [context, letter], 1
        elif form == "initial":
            sample, target = [letter, context], 0
        else:
            sample, target = [context, letter, context], 1
        records = shaped_records(hb_font, sample)
        asset = outline_asset(font, records, f"{letter}:{form}", {target})
        if asset is not None:
            asset["form"] = form
            asset["sampleContext"] = context
            return asset
    raise RuntimeError(f"OpenType shaping failed for {letter!r} ({form}) after {len(trials)} context samples")


def compile_font(key: str, family: str, path: str, source: str, axes: dict | None):
    font_path = ROOT / path
    if not font_path.exists():
        raise FileNotFoundError(f"Missing source font: {font_path}")
    font = TTFont(font_path)
    if axes and "fvar" in font:
        available = {axis.axisTag for axis in font["fvar"].axes}
        requested = {name: value for name, value in axes.items() if name in available}
        if requested:
            font = instantiateVariableFont(font, requested, inplace=False)
    hb_font = make_harfbuzz_font(font)
    result = {
        "meta": {
            "key": key,
            "family": family,
            "source": source,
            "unitsPerEm": int(font["head"].unitsPerEm),
            "shaping": "HarfBuzz OpenType",
        },
        "letters": {},
        "ligatures": {"lamAlef": {}},
    }

    for letter, form_ids in LETTERS:
        forms = {}
        for form, present in zip(FORMS, form_ids, strict=True):
            if present is None:
                continue
            forms[form] = glyph_for_form(font, hb_font, letter, form)
        result["letters"][letter] = forms

    for form, sample, target in (
        ("isolated", ["ل", "ا"], 0),
        ("final", ["ب", "ل", "ا"], 1),
    ):
        records = shaped_records(hb_font, sample)
        asset = outline_asset(font, records, f"lam-alef:{form}", {target, target + 1})
        if asset is not None:
            asset["form"] = form
            result["ligatures"]["lamAlef"][form] = asset
    return result


def main() -> None:
    styles = {}
    for key, family, path, source, axes in FONTS:
        styles[key] = compile_font(key, family, path, source, axes)
        count = sum(len(forms) for forms in styles[key]["letters"].values())
        print(f"Compiled {family}: {count} shaped glyph forms")
    payload = json.dumps(styles, ensure_ascii=False, separators=(",", ":"))
    content = "// Generated by scripts/build-font-assets.py. Do not edit by hand.\n"
    content += "// Vector outlines are built from the licensed typefaces listed in vendor-fonts/licenses/.\n"
    content += "export const FONT_GLYPHS = Object.freeze(" + payload + ");\n"
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(content):,} chars)")


if __name__ == "__main__":
    main()
