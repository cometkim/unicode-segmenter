/**
 * @typedef {[from: string, to: string]} UnicodeRange
 *
 * Encoded unicode range
 */

/**
 * @template {number} T
 * @typedef {[from: string, to: string, category: T]} CategorizedUnicodeRange
 *
 * Encoded unicode range with category code
 */

/**
 * @template {number} T
 * @typedef {[lower: number, upper: number, category: T]} SearchResult
 */

/**
 * @typedef {{
 *   segment: string,
 *   index: number,
 *   input: string,
 *   isWordLike?: boolean,
 * }} SegmentOutput
 */

/**
 * @typedef {IterableIterator<SegmentOutput>} Segmenter
 */

/**
 * @template {number} T
 * @param {string} ch
 * @param {Array<CategorizedUnicodeRange<T>>} table
 * @param {number} defaultLower
 * @param {number} defaultUpper
 * @return {SearchResult<T>}
 */
export function bsearchUnicodeRange(ch, table, defaultLower, defaultUpper, sliceFrom = 0, sliceTo = table.length) {
  let low = sliceFrom;
  let high = sliceTo - 1;

  while (low <= high) {
    let mid = low + high >> 1;
    let [lo, hi, cat] = table[mid];

    // Found some
    if (lo <= ch && ch <= hi) {
      return [lo.codePointAt(0), hi.codePointAt(0), cat];
    } else if (hi < ch) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Not found
  let lower = low > 0 ? table[low - 1][1].codePointAt(0) + 1 : defaultLower;
  let upper = table[low] ? table[low][0].codePointAt(0) - 1 : defaultUpper;
  return [lower, upper, 0 /* Any */];
}
