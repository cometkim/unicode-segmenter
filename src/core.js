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
 * Build eytzinger layout
 *
 * @template T
 * @param {T[]} arr 
 * @returns {T[]}
 */
export function eytzingerLayout(arr) {
  let n = arr.length
    , result = /** @type {T[]} */ (Array(n));
  function build(i = 0, k = 1) {
    if (k <= n) {
      i = build(i, 2 * k);
      result[k - 1] = arr[i++];
      i = build(i, 2 * k + 1);
    }
    return i;
  }
  build();
  return result;
}

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
  return eytzingerLayout(buf);
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
  let len = ranges.length
    , i = 1;

  while (i <= len) {
    let range = ranges[i - 1]
      , l = range[0]
      , h = range[1];
    if (l <= cp && cp <= h) return i - 1;
    i = 2 * i + (cp > h ? 1 : 0);
  }
  return -1;
}
