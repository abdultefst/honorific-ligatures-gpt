# Third-party notices

## Naqsh / Huruf Melt renderer components

Parts of Arabic normalization, contextual layout, deterministic seed helpers and the original Amiri outline data were adapted from [dralkh/naqsh](https://github.com/dralkh/naqsh).

- License: MIT
- Notice: [LICENSES/NAQSH-MIT.txt](LICENSES/NAQSH-MIT.txt)

## Amiri vector outlines

The default Naskh style uses compiled outlines from Amiri Regular.

- Source: https://github.com/aliftype/amiri
- Copyright: 2010–2022 The Amiri Project Authors
- License: SIL Open Font License 1.1
- License copy: [LICENSES/AMIRI-OFL.txt](LICENSES/AMIRI-OFL.txt)

## Additional Arabic typeface outlines

The selectable vector styles are compiled from the following source fonts from the Google Fonts repository. The original TTF files are kept under `vendor-fonts/` for reproducible builds; the generated SVG glyph paths are built during CI with HarfBuzz and FontTools. Their OFL notices are stored beside the source assets in `vendor-fonts/licenses/`, and copies are included in the published site.

| Vector style | Upstream source | License |
|---|---|---|
| Aref Ruqaa | https://github.com/google/fonts/tree/main/ofl/arefruqaa | OFL 1.1 |
| Reem Kufi | https://github.com/google/fonts/tree/main/ofl/reemkufi | OFL 1.1 |
| Rakkas | https://github.com/google/fonts/tree/main/ofl/rakkas | OFL 1.1 |
| Katibeh | https://github.com/google/fonts/tree/main/ofl/katibeh | OFL 1.1 |
| Lateef | https://github.com/google/fonts/tree/main/ofl/lateef | OFL 1.1 |
| Scheherazade New | https://github.com/google/fonts/tree/main/ofl/scheherazadenew | OFL 1.1 |

The Reem Kufi variable font is instantiated at weight 700 for the Kufi style. Typeface names are used to identify the upstream sources, not to imply endorsement by the font authors.

## Project-specific artwork

The selection UI, export actions, palette system, ornament algorithms, layout frames and visual composition are specific to رَونَق. The browser does not load web fonts at runtime: the exported SVG contains extracted vector glyph outlines plus procedural SVG paths and gradients.

Current limitations: Arabic diacritics and punctuation are not yet drawn as independent vector marks. The output is procedural composition based on source typefaces, not a claim that every result follows professionally reviewed traditional calligraphy rules.
