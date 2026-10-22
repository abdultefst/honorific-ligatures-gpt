# رَونَق — فنّ الخط بالكود

Arabic-first, code-generated calligraphy artwork built with self-contained SVG paths. The artwork is **not rendered as browser text** and does not depend on Google Fonts or a remote font service.

## Features

- Contextual Arabic letter forms and right-to-left word layout.
- Procedural composition with curves, frames, geometric details, texture, and metallic shading.
- Five art modes: royal, flowing, circular seal, geometric, and minimal.
- Six palettes and a deterministic seed that generates variations of the same phrase.
- Export standalone SVG vector paths or high-resolution PNG.
- Runs entirely in the browser; no server, paid API, runtime network request, or build step is required.
- Hosted on GitHub Pages.

## GitHub Pages

Workflow: `.github/workflows/pages.yml`. Pages publishes the repository root and the JavaScript modules in `src/`.

Live URL: https://abdultefst.github.io/honorific-ligatures-gpt/

To enable Pages after forking, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. Check the workflow run for the exact build/deploy status.

## Architecture

- `index.html`: responsive Arabic-first studio.
- `src/main.js`: controls and SVG/PNG export.
- `src/art-engine.js`: algorithmic composition, path placement, ornaments, frames, and gradients.
- `src/arabic.js`: Arabic normalization, contextual joining forms, lam–alef handling, and glyph layout.
- `src/generated/glyphs.js`: compiled Bézier outlines for supported Arabic letter forms.
- `src/hash.js`: deterministic variation helpers.

The exported SVG contains vector paths and SVG primitives, not live text nodes, web-font imports, or external images.

## Known limitations

- Glyph silhouettes are compiled from Amiri Regular outlines and then composed and decorated programmatically. They are not original hand-drawn glyph skeletons.
- Harakat, Quranic recitation marks, punctuation, and Latin characters are not rendered as vector marks in this version.
- The result is procedural art, not a claim of professionally reviewed Thuluth, Diwani, or another traditional script. Please verify the visual result before religious, engraved, legal, or permanent use.

## Run locally

Serve the repository directory with a static server (ES modules do not run reliably from a `file://` URL):

    python -m http.server 8000

Then open `http://localhost:8000`.

## Licensing

See [THIRD_PARTY.md](THIRD_PARTY.md), [LICENSES/NAQSH-MIT.txt](LICENSES/NAQSH-MIT.txt), and [LICENSES/AMIRI-OFL.txt](LICENSES/AMIRI-OFL.txt).