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
 * padding  = to - from
 * encoding = base36(from) + ',' + base36(padding)
 *
 * Notes:
 * - base36 can hold surprisingly large numbers in a few characters.
 * - The biggest codepoint is 0xE01F0 (918,000) at this point
 * - The max value of a category is 23; https://www.unicode.org/reports/tr29/tr29-45.html#Table_Word_Break_Property_Values
 * - The longest range is 42,720; CJK UNIFIED IDEOGRAPH-20000..CJK UNIFIED IDEOGRAPH-2A6DF
 */

/**
 * @template {number} [T=number]
 * @param {UnicodeDataEncoding} data
 * @param {string} [cats='']
 * @returns {Array<CategorizedUnicodeRange<T>>}
 */
export function decodeUnicodeData(data, cats = '') {
  let buf = /** @type {Array<CategorizedUnicodeRange<T>>} */([])
    , nums = data.split(',').map(s => s ? parseInt(s, 36) : 0)
    , n = 0;
  for (let i = 0; i < nums.length; i++)
    i % 2
      ? buf.push([n, n + nums[i], /** @type {T} */ (cats ? parseInt(cats[i >> 1], 36) : 0)])
      : n = nums[i];
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
 * @template {number} [T=number]
 * @param {number} cp
 * @param {CategorizedUnicodeRange<T>[]} ranges
 * @return {number} index of matched unicode range, or -1 if no match
 */
export function findUnicodeRangeIndex(cp, ranges) {
  let lo = 0
    , hi = ranges.length - 1;
  while (lo <= hi) {
    let mid = lo + hi >> 1
      , range = ranges[mid]
      , l = range[0]
      , h = range[1];
    if (l <= cp && cp <= h) return mid;
    else if (cp > h) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
