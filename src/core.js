// @ts-check

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
 * @template {object} Ext
 * @typedef {{
 *   segment: string,
 *   index: number,
 *   input: string,
 *   isWordLike?: boolean,
 * } & Ext} SegmentOutput
 */

/**
 * @template {object} T
 * @typedef {IterableIterator<SegmentOutput<T>>} Segmenter
 */

/**
 * @template T
 * @template C
 * @param {T} x
 * @param {Array<[T, T, C?]>} table
 * @param {number} [sliceFrom]
 * @param {number} [sliceTo]
 * @return {number} index of including range, or -(low+1) if there isn't
 */
export function bsearchRange(x, table, sliceFrom = 0, sliceTo = table.length) {
  let low = sliceFrom;
  let high = sliceTo - 1;

  while (low <= high) {
    let mid = low + high >> 1;
    let cur = table[mid];
    let l = cur[0], h = cur[1];
    if (l <= x && x <= h) {
      return mid;
    } else if (h < x) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -low-1;
}

/**
 * @template {number} T
 * @param {number} cp Unicode code point
 * @param {Array<CategorizedUnicodeRange<T>>} table
 * @param {number} defaultLower
 * @param {number} defaultUpper
 * @param {number} [sliceFrom]
 * @param {number} [sliceTo]
 * @return {SearchResult<T>}
 */
export function bsearchUnicodeRange(cp, table, defaultLower, defaultUpper, sliceFrom = 0, sliceTo = table.length) {
  let found = bsearchRange(cp, table, sliceFrom, sliceTo);
  if (found >= 0) {
    return table[found];
  }

  // Not found
  let low = -found-1;
  let lower = low > 0 ? table[low - 1][1] + 1 : defaultLower;
  let upper = table[low] ? table[low][0] - 1 : defaultUpper;
  // @ts-ignore
  return [lower, upper, 0 /* Any */];
}
