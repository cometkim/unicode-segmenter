/**
 * @typedef {[from: number, to: number]} UnicodeRange
 *
 * Encoded unicode range
 */

/**
 * @template {number} T
 * @typedef {[from: number, to: number, category: T]} CategorizedUnicodeRange
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
 * @param {number} cp Unicode code point
 * @param {Array<CategorizedUnicodeRange<T>>} table
 * @param {number} defaultLower
 * @param {number} defaultUpper
 * @return {SearchResult<T>}
 */
export function bsearchUnicodeRange(cp, table, defaultLower, defaultUpper, sliceFrom = 0, sliceTo = table.length) {
  let low = sliceFrom;
  let high = sliceTo - 1;

  while (low <= high) {
    let mid = low + high >> 1;
    let cur = table[mid];
    let lo = cur[0], hi = cur[1];

    // Found some
    if (lo <= cp && cp <= hi) {
      return cur;
    } else if (hi < cp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Not found
  let lower = low > 0 ? table[low - 1][1] + 1 : defaultLower;
  let upper = table[low] ? table[low][0] - 1 : defaultUpper;
  return [lower, upper, 0 /* Any */];
}
