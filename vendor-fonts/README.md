# Vector typeface build sources

Source TTF files are used only at build time to extract OpenType-shaped Arabic glyph outlines into `src/generated/font-styles.js`. The published website consumes the generated SVG path data, not these TTFs. All six source families are distributed under SIL Open Font License 1.1; see `licenses/`.

The generator is `scripts/build-font-assets.py` and uses FontTools for outlines and HarfBuzz for contextual shaping.
