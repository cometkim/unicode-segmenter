// @ts-check

/**
 * @import {
 *   UnicodeDataEncoding,
 *   UnicodeRange,
 *   CategorizedUnicodeRange,
 * } from '#src/core.js';
 */

/**
 * Ranges are sorted and never overlap, so the start of each range is
 * delta-encoded from the end of the previous one; small gap values
 * compress much better than absolute code points.
 *
 * @param {CategorizedUnicodeRange[]} ranges
 * @returns {UnicodeDataEncoding}
 */
export function encodeUnicodeData(ranges) {
  /** @type {number[]} */
  let buf = [];
  let prev = -1;
  for (let [from, to] of ranges) {
    let gap = from - prev - 1;
    let pad = to - from;
    buf.push(gap, pad);
    prev = to;
  }
  return /** @type {UnicodeDataEncoding} */ (
    buf.map(x => x ? x.toString(36) : '').join(',')
  );
}
