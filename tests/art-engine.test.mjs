import test from 'node:test';
import assert from 'node:assert/strict';
import { renderArtSvg } from '../src/art-engine.js';

const phrase = 'الحمد لله رب العالمين';
const modes = ['classic', 'flow', 'seal', 'geometric', 'minimal'];

for (const mode of modes) {
  test(`renders standalone vector artwork in ${mode} mode`, () => {
    const result = renderArtSvg(phrase, { mode, palette: 'gold', seed: 'ci-art', detail: 3 });
    assert.match(result.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.ok(result.glyphCount >= 8);
    assert.ok(result.lineCount >= 1);
    assert.ok((result.svg.match(/<path\b/g) || []).length > 10);
    assert.doesNotMatch(result.svg, /<text(?:\s|>)/i);
    assert.doesNotMatch(result.svg, /fonts\.googleapis\.com|font-family\s*:/i);
  });
}

test('seed changes the ornaments while keeping the phrase renderable', () => {
  const a = renderArtSvg(phrase, { seed: 'first', mode: 'classic' });
  const b = renderArtSvg(phrase, { seed: 'second', mode: 'classic' });
  assert.notEqual(a.svg, b.svg);
  assert.equal(a.glyphCount, b.glyphCount);
});

test('refuses blank text and text without supported Arabic glyphs', () => {
  assert.throws(() => renderArtSvg(''));
  assert.throws(() => renderArtSvg('hello 123'));
});
