// @ts-check

/**
 * @typedef {[point: number, padding: number]} UnicodeRange
 *
 * Encoded unicode range
 */

/**
 * @template {number} T
 * @typedef {[point: number, padding: number, category: T]} CategorizedUnicodeRange
 *
 * Encoded unicode range with category code.
 *
 * NOTE: It might be garbage `from` and `to` values when the `category` is `Any`.
 */

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
 * @template C
 * @param {T} x
 * @param {Array<[T, T, C?]>} table
 * @param {number} [sliceFrom]
 * @param {number} [sliceTo]
 * @return {number} index of including range, or -(low+1) if there isn't
 */
export function bsearchRange(x, table, sliceFrom = 0, sliceTo = table.length) {
  let lo = sliceFrom;
  let hi = sliceTo - 1;

  while (lo <= hi) {
    let mid = lo + hi >> 1;
    let row = table[mid];
    let l = row[0], h = l + row[1];
    if (l <= x && x <= h) {
      return mid;
    } else if (h < x) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return -lo-1;
}

/**
 * @template {number} T
 * @param {number} cp Unicode code point
 * @param {Array<CategorizedUnicodeRange<T>>} table
 * @param {number} defaultLower
 * @param {number} defaultUpper
 * @param {number} [sliceFrom]
 * @param {number} [sliceTo]
 * @return {CategorizedUnicodeRange<T>}
 */
export function bsearchUnicodeRange(cp, table, defaultLower, defaultUpper, sliceFrom = 0, sliceTo = table.length) {
  let found = bsearchRange(cp, table, sliceFrom, sliceTo);
  if (found >= 0) {
    return table[found];
  }

  // Not found
  let cursor = -found-1;

  let lower = defaultLower;
  if (cursor > 0) {
    let range = table[cursor - 1];
    lower = range[0] + range[1] + 1;
  }

  let upper = defaultUpper;
  let range = table[cursor];
  if (range) {
    upper = range[0] - 1;
  }

  // @ts-ignore
  return [lower, upper - lower, 0 /* Any */];
}
