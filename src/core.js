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
 * @param {T} x
 * @param {ArrayLike<T>} table
 * @param {number} [sliceFrom]
 * @param {number} [sliceTo]
 * @return {number} index of including range, or (-low) if there isn't
 */
export function bsearchRange(x, table, sliceFrom = 0, sliceTo = table.length) {
  let lo = sliceFrom;
  let hi = sliceTo - 2;

  while (lo <= hi) {
    let mid = lo + hi >> 1 & ~1;
    let l = table[mid], h = table[mid + 1];
    if (l <= x && x <= h) {
      return mid;
    } else if (h < x) {
      lo = mid + 2;
    } else {
      hi = mid - 2;
    }
  }

  return -lo;
}

/**
 * @param {ArrayLike<number>} table
 * @param {string} value
 * @return {ArrayLike<number>}
 */
export function createTable(table, value, sep = ',') {
  let nums = value.split(sep).map(s => s ? parseInt(s, 36) : 0);
  for (let i = 0; i < nums.length; i++)
    // @ts-ignore
    table[i] = nums[i];
  return table;
};

/**
 * @param {ArrayLike<number>} table
 * @param {string} value
 * @return {ArrayLike<number>}
 */
export function createRangeTable(table, value) {
  let nums = value.split(',').map(s => s ? parseInt(s, 36) : 0);
  for (let i = 0, n = 0; i < nums.length; i++)
    // @ts-ignore
    table[i] = i % 2 ? n + nums[i] : (n = nums[i]);
  return table;
};
