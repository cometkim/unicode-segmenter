// @ts-check

/**
 * @template {number} [T=number]
 * @typedef {[from: number, to: number, category: T]} CategorizedUnicodeRange
 */

/**
 * @typedef {CategorizedUnicodeRange<0>} UnicodeRange
 */

/**
 * @typedef {string & { __tag: 'UnicodeDataEncoding' }} UnicodeDataEncoding
 *
 * Encoding for array of {@link UnicodeRange}, items separated by comma.
 *
 * Each {@link UnicodeDataRow} packed as a base36 integer:
 *
 *         | category | padding  |
 * base36( | -------- | -------- | ) + ',' + base36(codepoint)
 *         | 16 bytes | 16 bytes |
 *
 * Notes:
 * - base36 can hold surprisingly large numbers in a few characters.
 * - The biggest codepoint is 0xE01F0 (918,000) at this point
 * - The max value of a category is 23; https://www.unicode.org/reports/tr29/tr29-45.html#Table_Word_Break_Property_Values
 * - The longest range is 42,720; CJK UNIFIED IDEOGRAPH-20000..CJK UNIFIED IDEOGRAPH-2A6DF
 * - So largest number is (23 << 16) + 42,719 = 1,550,047, which can be fit in 32-bit, only 4 characters (x80v) in base36
 * - Even there is no category, it doesn't inflate the data size because it fills the zero value
 */

/**
 * @template {number} [T=number]
 * @param {UnicodeDataEncoding} data
 * @returns {Array<CategorizedUnicodeRange<T>>}
 */
export function decodeUnicodeData(data) {
  let splits = data.split(',')
    , buf = /** @type {Array<CategorizedUnicodeRange<T>>} */([])
    , cat = 0
    , pad = 0;
  for (let i = 0; i < splits.length; i++) {
    let s = splits[i], val = s ? parseInt(s, 36) : 0;
    i % 2
      ? buf.push([val, val + pad, /** @type {T} */ (cat)])
      : cat = val >> 16, pad = val & 65535;
  }
  return buf;
}

/**
 * @template {object} Ext
 * @typedef {{
 *   segment: string,
 *   index: number,
 *   input: string,
 * } & Ext} SegmentOutput
 */

/**
 * @template {object} T
 * @typedef {IterableIterator<SegmentOutput<T>>} Segmenter
 */

/**
 * @template {number} T
 * @param {T} x
 * @param {CategorizedUnicodeRange[]} ranges
 * @return {number} index of including range, or -(low+1) if there isn't
 */
export function searchUnicodeRange(x, ranges) {
  let lo = 0;
  let hi = ranges.length - 1;

  while (lo <= hi) {
    let mid = lo + hi >> 1
      , range = ranges[mid]
      , l = range[0]
      , h = range[1];
    if (l <= x && x <= h) {
      return mid;
    } else if (h < x) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return -lo - 1;
}
