// @ts-check

/**
 * Take a Unicode code point from the given input by cursor
 *
 * @param {string} input
 * @param {number} cursor
 * @param {number} [length] length of input
 * @return {number} a code point of the character
 */
export function takeCodePoint(input, cursor, length = input.length) {
  let hi = input.charCodeAt(cursor);
  if (isHighSurrogate(hi)) {
    if (cursor + 1 < length) {
      let lo = input.charCodeAt(cursor + 1);
      if (isLowSurrogate(lo)) {
        return surrogatePairToCodePoint(hi, lo);
      }
    }
  }
  return hi;
}

/**
 * Take a UTF-8 char from the given input by cursor
 *
 * @param {string} input
 * @param {number} cursor
 * @param {number} [length] length of input
 * @return {string} a UTF-8 character (its `.length` will be 1 or 2)
 */
export function takeChar(input, cursor, length = input.length) {
  let cp = takeCodePoint(input, cursor, length);
  return String.fromCodePoint(cp);
}

/** 
 * @param {number} c UTF-16 code
 */
export function isHighSurrogate(c) {
  return 0xd800 <= c && c <= 0xdbff;
}

/** 
 * @param {number} c UTF-16 code
 */
export function isLowSurrogate(c) {
  return 0xdc00 <= c && c <= 0xdfff;
}

/** 
 * @param {number} hi high surrogate
 * @param {number} lo low surrogate
 */
export function surrogatePairToCodePoint(hi, lo) {
  return ((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
}
