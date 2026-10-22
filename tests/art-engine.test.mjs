import test from 'node:test';
import assert from 'node:assert/strict';
import { renderArtSvg } from '../src/art-engine.js';
import { layoutGlyphs, normalizeArabic, VECTOR_FONT_STYLES } from '../src/arabic.js';

const phrase = 'الحمد لله رب العالمين';
const modes = ['classic', 'flow', 'seal', 'geometric', 'minimal'];
const fontStyles = VECTOR_FONT_STYLES.map(style => style.key);

for (const mode of modes) {
  test(`renders standalone vector artwork in ${mode} composition mode`, () => {
    const result = renderArtSvg(phrase, { mode, palette: 'gold', fontStyle: 'amiri', seed: 'ci-art', detail: 3 });
    assert.match(result.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.ok(result.glyphCount >= 8);
    assert.ok(result.lineCount >= 1);
    assert.ok((result.svg.match(/<path\b/g) || []).length > 10);
    assert.doesNotMatch(result.svg, /<text(?:\s|>)/i);
    assert.doesNotMatch(result.svg, /fonts\.googleapis\.com|font-family\s*:/i);
  });
}

for (const fontStyle of fontStyles) {
  test(`renders real ${fontStyle} vector glyphs`, () => {
    const result = renderArtSvg(phrase, { fontStyle, seed: 'same-seed', mode: 'minimal', palette: 'gold' });
    assert.equal(result.fontStyle, fontStyle);
    assert.ok(result.glyphCount >= 8);
    assert.match(result.svg, /<path\b/);
    assert.doesNotMatch(result.svg, /<text(?:\s|>)/i);
  });
}

test('each selected typeface has its own actual glyph outlines', () => {
  const letters = [...normalizeArabic('الحروف العربية')];
  const signatures = fontStyles.map(style =>
    layoutGlyphs(letters, style).tokens.map(token => token.glyph.path).join('|')
  );
  assert.equal(new Set(signatures).size, fontStyles.length);
});

test('seed changes ornaments while preserving the glyph silhouette', () => {
  const a = renderArtSvg(phrase, { seed: 'first', mode: 'classic', fontStyle: 'rakkas' });
  const b = renderArtSvg(phrase, { seed: 'second', mode: 'classic', fontStyle: 'rakkas' });
  assert.notEqual(a.svg, b.svg);
  const letterSignature = svg => svg.match(/<g fill="#000"[^>]*>(.*?)<\/g><g fill="url\(#metal\)"/s)?.[1];
  assert.equal(letterSignature(a.svg), letterSignature(b.svg));
});

test('refuses blank text and text without supported Arabic glyphs', () => {
  assert.throws(() => renderArtSvg(''));
  assert.throws(() => renderArtSvg('hello 123'));
});
