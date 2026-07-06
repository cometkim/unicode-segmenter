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
 * Each {@link UnicodeDataRow} packed as a pair of base36 integers:
 *
 * gap      = from - (previous to) - 1
 * padding  = to - from
 * encoding = base36(gap) + ',' + base36(padding)
 *
 * Notes:
 * - Ranges are sorted and never overlap, so the delta-encoded gap is
 *   always non-negative, and mostly a single character.
 * - Zero encodes as an empty string.
 * - base36 can hold surprisingly large numbers in a few characters.
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
    , n = 0
    , p = -1;
  for (let i = 0; i < nums.length; i++)
    i % 2
      ? buf.push([n, p = n + nums[i], /** @type {T} */ (cats ? parseInt(cats[i >> 1], 36) : 0)])
      : n = p + 1 + nums[i];
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
export function findUnicodeRangeIndex(cp, ranges, lo = 0, hi = ranges.length - 1) {
  while (lo <= hi) {
    let mid = lo + hi >>> 1
      , range = ranges[mid];
    if (cp < range[0]) hi = mid - 1;
    else if (cp > range[1]) lo = mid + 1;
    else return mid;
  }
  return -1;
}
