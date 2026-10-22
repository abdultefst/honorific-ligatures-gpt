export const LETTER_DEFINITIONS = Object.freeze([
  { letter: 'ا', name: 'alef', forms: [0xfe8d, 0xfe8e, null, null] },
  { letter: 'ب', name: 'baa', forms: [0xfe8f, 0xfe90, 0xfe91, 0xfe92] },
  { letter: 'ت', name: 'taa', forms: [0xfe95, 0xfe96, 0xfe97, 0xfe98] },
  { letter: 'ث', name: 'thaa', forms: [0xfe99, 0xfe9a, 0xfe9b, 0xfe9c] },
  { letter: 'ج', name: 'jeem', forms: [0xfe9d, 0xfe9e, 0xfe9f, 0xfea0] },
  { letter: 'ح', name: 'haa', forms: [0xfea1, 0xfea2, 0xfea3, 0xfea4] },
  { letter: 'خ', name: 'khaa', forms: [0xfea5, 0xfea6, 0xfea7, 0xfea8] },
  { letter: 'د', name: 'dal', forms: [0xfea9, 0xfeaa, null, null] },
  { letter: 'ذ', name: 'dhal', forms: [0xfeab, 0xfeac, null, null] },
  { letter: 'ر', name: 'raa', forms: [0xfead, 0xfeae, null, null] },
  { letter: 'ز', name: 'zay', forms: [0xfeaf, 0xfeb0, null, null] },
  { letter: 'س', name: 'seen', forms: [0xfeb1, 0xfeb2, 0xfeb3, 0xfeb4] },
  { letter: 'ش', name: 'sheen', forms: [0xfeb5, 0xfeb6, 0xfeb7, 0xfeb8] },
  { letter: 'ص', name: 'sad', forms: [0xfeb9, 0xfeba, 0xfebb, 0xfebc] },
  { letter: 'ض', name: 'dad', forms: [0xfebd, 0xfebe, 0xfebf, 0xfec0] },
  { letter: 'ط', name: 'tah', forms: [0xfec1, 0xfec2, 0xfec3, 0xfec4] },
  { letter: 'ظ', name: 'zah', forms: [0xfec5, 0xfec6, 0xfec7, 0xfec8] },
  { letter: 'ع', name: 'ain', forms: [0xfec9, 0xfeca, 0xfecb, 0xfecc] },
  { letter: 'غ', name: 'ghain', forms: [0xfecd, 0xfece, 0xfecf, 0xfed0] },
  { letter: 'ف', name: 'faa', forms: [0xfed1, 0xfed2, 0xfed3, 0xfed4] },
  { letter: 'ق', name: 'qaf', forms: [0xfed5, 0xfed6, 0xfed7, 0xfed8] },
  { letter: 'ك', name: 'kaf', forms: [0xfed9, 0xfeda, 0xfedb, 0xfedc] },
  { letter: 'ل', name: 'lam', forms: [0xfedd, 0xfede, 0xfedf, 0xfee0] },
  { letter: 'م', name: 'meem', forms: [0xfee1, 0xfee2, 0xfee3, 0xfee4] },
  { letter: 'ن', name: 'noon', forms: [0xfee5, 0xfee6, 0xfee7, 0xfee8] },
  { letter: 'ه', name: 'haa-final', forms: [0xfee9, 0xfeea, 0xfeeb, 0xfeec] },
  { letter: 'و', name: 'waw', forms: [0xfeed, 0xfeee, null, null] },
  { letter: 'ي', name: 'yaa', forms: [0xfef1, 0xfef2, 0xfef3, 0xfef4] },
]);

export const ARABIC_ALPHABET = Object.freeze(
  LETTER_DEFINITIONS.map(({ letter }) => letter),
);

export const LETTER_NAMES = Object.freeze(
  Object.fromEntries(LETTER_DEFINITIONS.map(({ letter, name }) => [letter, name])),
);

export const FORM_NAMES = Object.freeze(['isolated', 'final', 'initial', 'medial']);

export const NON_LEFT_JOINING = new Set(['ا', 'د', 'ذ', 'ر', 'ز', 'و']);
