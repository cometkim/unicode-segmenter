// @ts-check

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
