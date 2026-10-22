/** FNV-1a over UTF-16 code units, matching DiceBear's cross-language seed model. */
export function hashSeed(input) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

export function hashHex(input) {
  return hashSeed(input).toString(16).padStart(8, '0');
}

function mulberry32(seed) {
  let state = seed | 0;

  return () => {
    const value = (state = (state + 0x6d2b79f5) | 0);
    let mixed = Math.imul(value ^ (value >>> 15), value | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32;
  };
}

/** A call-order-independent deterministic value in [0, 1). */
export function keyedValue(seed, key) {
  return mulberry32(hashSeed(`${seed}:${key}`))();
}

export function keyedInteger(seed, key, min, max) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);

  return Math.floor(keyedValue(seed, key) * (high - low + 1)) + low;
}

export function keyedFloat(seed, key, min, max) {
  return min + keyedValue(seed, key) * (max - min);
}

export function keyedPick(seed, key, values) {
  if (values.length === 0) {
    return undefined;
  }

  return values[Math.floor(keyedValue(seed, key) * values.length)];
}

export function keyedShuffle(seed, key, values) {
  const result = [...values];
  const random = mulberry32(hashSeed(`${seed}:${key}`));

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }

  return result;
}
