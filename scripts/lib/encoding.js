// @ts-check

/**
 * @import {
 *   UnicodeDataEncoding,
 *   UnicodeRange,
 *   CategorizedUnicodeRange,
 * } from '#src/core.js';
 */

/**
 * @param {CategorizedUnicodeRange[]} ranges
 * @returns {UnicodeDataEncoding}
 */
export function encodeUnicodeData(ranges) {
  /** @type {number[]} */
  let buf = [];
  for (let [from, to] of ranges) {
    let pad = to - from;
    buf.push(from, pad);
  }
  return /** @type {UnicodeDataEncoding} */ (
    buf.map(x => x ? x.toString(36) : '').join(',')
  );
}
