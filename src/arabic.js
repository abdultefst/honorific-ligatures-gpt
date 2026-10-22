import { GLYPH_ASSETS } from './generated/glyphs.js';
import { FONT_GLYPHS } from './generated/font-styles.js';
import { keyedShuffle } from './hash.js';
import {
  ARABIC_ALPHABET,
  LETTER_NAMES,
  NON_LEFT_JOINING,
} from './letters.js';

const FONT_ASSETS = Object.freeze({ amiri: GLYPH_ASSETS, ...FONT_GLYPHS });

export const VECTOR_FONT_STYLES = Object.freeze([
  { key: 'amiri', name: 'نسخ تقليدي · Amiri' },
  { key: 'aref', name: 'رقعة · Aref Ruqaa' },
  { key: 'reemkufi', name: 'كوفي هندسي · Reem Kufi' },
  { key: 'rakkas', name: 'رقّاص زخرفي · Rakkas' },
  { key: 'katibeh', name: 'كاتبة · Katibeh' },
  { key: 'lateef', name: 'لطيف انسيابي · Lateef' },
  { key: 'scheherazade', name: 'نسخ واضح · Scheherazade New' },
]);

const ALIASES = Object.freeze({
  'أ': 'ا',
  'إ': 'ا',
  'آ': 'ا',
  'ٱ': 'ا',
  'ء': 'ا',
  'ؤ': 'و',
  'ئ': 'ي',
  'ى': 'ي',
  'ة': 'ه',
  'ی': 'ي',
  'ک': 'ك',
  'گ': 'ك',
  'پ': 'ب',
  'چ': 'ج',
  'ژ': 'ز',
  'ڤ': 'ف',
});

const DIACRITICS = /[\u0610-\u061a\u0640\u064b-\u065f\u0670\u06d6-\u06ed]/gu;
const ALPHABET_SET = new Set(ARABIC_ALPHABET);

export function normalizeArabic(value) {
  const normalized = String(value).normalize('NFKC').replace(DIACRITICS, '');

  return [...normalized]
    .map((character) => ALIASES[character] ?? character)
    .filter((character) => ALPHABET_SET.has(character))
    .join('');
}

export function resolveLetters(seed, letterCount = 2) {
  const count = Math.max(1, Math.min(3, Math.trunc(letterCount)));
  const fromSeed = [...normalizeArabic(seed)];

  if (fromSeed.length > 0) {
    return fromSeed.slice(0, count);
  }

  return keyedShuffle(String(seed), 'arabic-letters', ARABIC_ALPHABET).slice(0, count);
}

function connectsLeft(character) {
  return !NON_LEFT_JOINING.has(character);
}

function joins(characters, index) {
  const current = characters[index];
  const previous = characters[index - 1];
  const next = characters[index + 1];

  const previousJoin = Boolean(previous) && connectsLeft(previous);
  const nextJoin = Boolean(next) && connectsLeft(current);

  if (previousJoin && nextJoin) {
    return 'medial';
  }
  if (previousJoin) {
    return 'final';
  }
  if (nextJoin) {
    return 'initial';
  }

  return 'isolated';
}

/** Resolve Arabic contextual forms from a selected, precompiled vector typeface. */
export function shapeLetters(characters, fontStyle = 'amiri') {
  const assets = FONT_ASSETS[fontStyle] ?? GLYPH_ASSETS;
  const result = [];

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (character === 'ل' && characters[index + 1] === 'ا') {
      const previousJoin = index > 0 && connectsLeft(characters[index - 1]);
      const form = previousJoin ? 'final' : 'isolated';
      const ligature = assets.ligatures?.lamAlef?.[form];
      if (ligature) {
        result.push({ character: 'لا', name: 'lam-alef', form, glyph: ligature });
        index += 1;
        continue;
      }
      // Some typefaces do not publish a dedicated lam-alef presentation form.
      // Keep both letters in the chosen typeface rather than silently mixing outlines.
    }

    const form = joins(characters, index);
    const glyph = assets.letters[character]?.[form]
      ?? assets.letters[character]?.isolated;

    if (!glyph) {
      throw new Error(`Missing vector glyph for ${character} in style ${fontStyle}`);
    }

    result.push({ character, name: LETTER_NAMES[character], form, glyph });
  }

  return result;
}

export function layoutGlyphs(characters, fontStyle = 'amiri') {
  const shaped = shapeLetters(characters, fontStyle);
  let cursor = 0;
  const positioned = [];

  // Arabic logical order starts on the right, so advances move leftward.
  for (const token of shaped) {
    cursor -= token.glyph.advance;
    positioned.push({ ...token, x: cursor });
  }

  const bounds = positioned.reduce(
    (current, token) => {
      const [xMin, yMin, xMax, yMax] = token.glyph.bounds;
      return {
        xMin: Math.min(current.xMin, token.x + xMin),
        yMin: Math.min(current.yMin, yMin),
        xMax: Math.max(current.xMax, token.x + xMax),
        yMax: Math.max(current.yMax, yMax),
      };
    },
    { xMin: Infinity, yMin: Infinity, xMax: -Infinity, yMax: -Infinity },
  );

  return { tokens: positioned, bounds };
}
