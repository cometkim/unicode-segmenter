// @ts-check

/**
 * Take a Unicode code point from the given input by cursor
 *
 * @deprecated
 * Use this only if `String.prototype.codePointAt()` isn't available on the host environment
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
 * @deprecated
 * Use this only if `String.fromCodePoint()` isn't available on the host environment
 *
 * @param {string} input
 * @param {number} cursor
 * @param {number} [length] length of input
 * @return {string} a UTF-8 character (its `.length` will be 1 or 2)
 */
export function takeChar(input, cursor, length = input.length) {
  let hi = input.charCodeAt(cursor);
  if (isHighSurrogate(hi)) {
    if (cursor + 1 < length) {
      let lo = input.charCodeAt(cursor + 1);
      if (isLowSurrogate(lo)) {
        // This seems to be much slower in V8
        // return String.fromCharCode(hi, lo);
        return String.fromCharCode(hi) + String.fromCharCode(lo);
      }
    }
  }
  return String.fromCharCode(hi);
}

/** 
 * @param {number} c UTF-16 code point
 */
export function isHighSurrogate(c) {
  return 0xd800 <= c && c <= 0xdbff;
}

/** 
 * @param {number} c UTF-16 code point
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

/**
 * Check if given code point is within the BMP(Basic Multilingual Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
export function isBMP(c) {
  return c <= 0xffff;
}

/**
 * Check if given code point is within the SMP(Supplementary Multilingual Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
export function isSMP(c) {
  return 0x10000 <= c && c <= 0x1ffff;
}

/**
 * Check if given code point is within the SIP(Supplementary Ideographic Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
export function isSIP(c) {
  return 0x20000 <= c && c <= 0x2ffff;
}

/**
 * Check if given code point is within the TIP(Tertiary Ideographic Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
export function isTIP(c) {
  return 0x30000 <= c && c <= 0x3ffff;
}

/**
 * Check if given code point is within the SSP(Supplementary Special-purpose Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
export function isSSP(c) {
  return 0xe0000 <= c && c <= 0xeffff;
}
