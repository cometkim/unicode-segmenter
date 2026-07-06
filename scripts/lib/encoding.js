// @ts-check

/**
 * @import {
 *   UnicodeDataEncoding,
 *   CategorizedUnicodeRange,
 * } from '#src/core.js';
 */

/**
 * Variable-length quantity in the base36 alphabet;
 * 4 payload bits and a continuation bit per character, no separators.
 *
 * Every character stays within `[0-9a-v]`, so the decoder is a native
 * `parseInt(char, 36)` and the data shares its character class with
 * the other encoded strings for better compression.
 *
 * @param {number} n non-negative integer
 * @return {string}
 */
function vlq(n) {
  let out = '';
  do {
    let digit = n & 15;
    n >>>= 4;
    out += (digit | (n ? 16 : 0)).toString(36);
  } while (n);
  return out;
}

/**
 * Ranges are sorted and never overlap, so the start of each range is
 * delta-encoded from the end of the previous one; small gap values
 * compress much better than absolute code points.
 *
 * @param {CategorizedUnicodeRange[]} ranges
 * @returns {UnicodeDataEncoding}
 */
export function encodeUnicodeData(ranges) {
  let out = '';
  let prev = -1;
  for (let [from, to] of ranges) {
    out += vlq(from - prev - 1) + vlq(to - from);
    prev = to;
  }
  return /** @type {UnicodeDataEncoding} */ (out);
}