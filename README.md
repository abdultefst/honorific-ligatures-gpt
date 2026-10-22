# رَونَق — Arabic Art Studio

An Arabic-first, browser-based typography studio that turns **any Arabic text** into a styled calligraphic composition. Unlike the earlier phrase-replacement version, it does not require a phrase to exist in a predefined ligature list.

## Features
- Live preview for arbitrary Arabic text, names, quotations, and longer phrases.
- Five web-font styles: Aref Ruqaa, Lateef, Scheherazade New, Reem Kufi, and Noto Naskh Arabic.
- Custom ink palettes, four backgrounds, decorative frames, layout presets, and font-size control.
- Sample phrases, character count, copy text, and SVG export.
- Responsive desktop/mobile interface.
- No backend and no text upload; text stays in the browser.
- Static HTML: no build process required, suitable for GitHub Pages.

## How it works
Modern browsers use Arabic script shaping and bidirectional text layout to select contextual letterforms, connect letters, position marks, and apply font OpenType features. The selected font controls the visual style. This creates a calligraphic treatment for arbitrary text; it does not automatically redesign every phrase as a unique hand-composed traditional calligraphy piece. Exported SVG contains text and may load its selected Google Font over the internet.

## Run locally
Open `index.html` in a modern browser with internet access to load Google Fonts.

## GitHub Pages
The workflow at `.github/workflows/pages.yml` deploys the repository root. In **Settings → Pages**, choose **GitHub Actions** as the source if it is not already enabled.

Expected URL: https://abdultefst.github.io/honorific-ligatures-gpt/

## Font licensing
The listed font families are available through Google Fonts and are published under open font licenses. Check each font's current license and attribution details at https://fonts.google.com/ before redistributing modified font files.
