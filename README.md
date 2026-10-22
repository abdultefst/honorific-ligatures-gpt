# رَونَق — Arabic Honorific Art Studio

A small Arabic-first web app that converts common Islamic honorific phrases into artistic calligraphic ligatures in a live preview.

## Features
- Arabic RTL interface and live text preview.
- Matches 40+ known honorific phrases, including رحمـه الله، رضي الله عنه، صلى الله عليه وسلم، عز وجل.
- Browse a glyph gallery and insert phrases with one click.
- Copy the rendered output or copy readable Arabic text.
- Export an SVG preview.
- Browser-only processing; the typed text is not sent to a backend.
- Designed for GitHub Pages; no build step required.

## Run locally
Open `index.html` in a modern browser. An internet connection is required to load the WOFF2 font used for the calligraphic ligatures.

## Publish with GitHub Pages
In the repository settings, open **Pages**, select **Deploy from a branch**, choose **main** and **/(root)**, then save. The site should appear at:
`https://abdultefst.github.io/honorific-ligatures-gpt/`

## Font and artwork attribution
The calligraphic font is loaded from [Arabic Honorifics Complete](https://github.com/eraduz/ArabicHonorificsComplete), built from artwork by **BaAlwi Heritage (ID)** ([source artwork](https://github.com/baalwi-id/arabic-honorific-ligatures)), licensed under **CC BY 4.0**. This project is a separate interface and should retain that attribution. Changes include the browser UI, phrase matching, and export workflow.

## Important copy/paste note
PUA characters U+E900–U+E93C need the matching font to display as intended. Use the “Copy Arabic text” button for portable, readable Arabic. Unicode characters such as ﷺ and ﷽ are more portable, although their appearance depends on the receiving font.
