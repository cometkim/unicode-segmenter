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
 * Encoding for array of {@link UnicodeRange}, as a separator-free
 * sequence of variable-length quantities in the base36 alphabet;
 * each character carries 4 payload bits and a continuation bit.
 *
 * Each {@link UnicodeRange} packed as a pair of quantities:
 *
 * gap      = from - (previous to) - 1
 * padding  = to - from
 *
 * Notes:
 * - Ranges are sorted and never overlap, so the delta-encoded gap is
 *   always non-negative, and mostly a single character.
 * - The max value of a category is 23; https://www.unicode.org/reports/tr29/tr29-45.html#Table_Word_Break_Property_Values
 * - The longest range is 42,720; CJK UNIFIED IDEOGRAPH-20000..CJK UNIFIED IDEOGRAPH-2A6DF
 *
 * See `scripts/lib/encoding.js` for the encoder.
 */

/**
 * @template {number} [T=number]
 * @param {UnicodeDataEncoding} data
 * @param {string} [cats='']
 * @returns {Array<CategorizedUnicodeRange<T>>}
 */
export function decodeUnicodeData(data, cats = '') {
  let buf = /** @type {Array<CategorizedUnicodeRange<T>>} */([])
    , len = data.length
    , i = 0
    , j = 0
    , p = -1;
  let read = () => {
    let n = 0, shift = 0, d;
    do {
      d = parseInt(data[i++], 36);
      n += (d & 15) << shift;
      shift += 4;
    } while (d & 16);
    return n;
  };
  while (i < len) {
    let from = p + 1 + read();
    p = from + read();
    buf.push([from, p, /** @type {T} */ (cats ? parseInt(cats[j++], 36) : 0)]);
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
