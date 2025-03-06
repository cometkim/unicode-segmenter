// @ts-check

/**
 * @import {
 *   UnicodeDataEncoding,
 *   UnicodeRange,
 *   CategorizedUnicodeRange,
 * } from '#src/core.js';
 */

/**
 * Build eytzinger layout array
 *
 * @template T
 * @param {T[]} arr 
 * @returns {T[]}
 */
export function eytzingerLayout(arr) {
  let n = arr.length;
  let result = /** @type {T[]} */ (Array(n));
  function build(i, k) {
    if (k <= n) {
      i = build(i, 2 * k);
      result[k - 1] = arr[i++];
      i = build(i, 2 * k + 1);
    }
    return i;
  }
  build(0, 1);
  return result;
}

/**
 * @param {CategorizedUnicodeRange[]} ranges
 * @returns {UnicodeDataEncoding}
 */
export function encodeUnicodeData(ranges) {
  let eytzinger = eytzingerLayout(ranges);
  /** @type {number[]} */
  let buf = [];
  for (let [from, to] of eytzinger) {
    let pad = to - from;
    buf.push(from, pad);
  }
  return /** @type {UnicodeDataEncoding} */ (
    buf.map(x => x ? x.toString(36) : '').join(',')
  );
}
