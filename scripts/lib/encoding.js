// @ts-check
//
/**
 * @import {
 *   UnicodeDataEncoding,
 *   UnicodeRange,
 *   CategorizedUnicodeRange,
 * } from '#src/core.js';
 */

/**
 * @param {UnicodeRange[] | CategorizedUnicodeRange[]} ranges
 * @returns {UnicodeDataEncoding}
 */
export function encodeUnicodeData(ranges) {
  /** @type {number[]} */
  let buf = [];
  for (let [from, to, cat = 0 /* Any */] of ranges) {
    let pad = to - from;
    let fst = (cat << 16) | pad
      , snd = from;
    buf.push(fst, snd);
  }
  return /** @type {UnicodeDataEncoding} */ (
    buf.map(x => x ? x.toString(36) : '').join(',')
  );
}
