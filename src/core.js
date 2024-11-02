// @ts-check

/**
 * @typedef {[from: number, to: number]} UnicodeRange
 *
 * [from..to] code points included
 */

/**
 * @template {number} T
 * @typedef {[fro: number, to: number, category: T]} CategorizedUnicodeRange
 */

/**
 * @typedef {string & { __tag: 'LookupTableEncoding' }} LookupTableEncoding
 *
 * Base36 encoded {@link LookupTableBuffer} data. It's a sequence of `base36(code point)` with separators.
 *
 * Separator can be omitted if each value is small (=< 36)
 */

/**
 * @typedef {ArrayLike<number> & { __tag: 'LookupTableBuffer' }} LookupTableBuffer
 *
 * Value lookup table serialized into a TypedArray
 */

/**
 * @typedef {ArrayLike<number> & { __tag: 'UnicodeRangeBuffer' }} UnicodeRangeBuffer
 *
 * {@link UnicodeRange} data serialized into a TypedArray
 *
 * It's a dense array like `[from,to,from,to,...]`
 * So always has an even length and is quantized into 2-items chunks.
 *
 * The pairs must be sorted in ascending order to allow binary search. 
 */

/**
 * @typedef {string & { __tag: 'UnicodeRangeEncoding' }} UnicodeRangeEncoding
 *
 * Base36 encoded {@link UnicodeRangeBuffer} data. It's a sequence of `base36(code point),base36(padding)`
 *
 * Value `0` is represented as empty strings
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
 * @param {UnicodeRangeBuffer} buffer
 * @param {number} [sliceFrom]
 * @param {number} [sliceTo]
 * @return {number} index of including range, or -(low+1) if there isn't
 */
export function searchUnicodeRange(x, buffer, sliceFrom = 0, sliceTo = buffer.length) {
  let lo = sliceFrom;
  let hi = sliceTo - 2;

  while (lo <= hi) {
    let mid = lo + hi >> 1 & ~1;
    let l = buffer[mid], h = buffer[mid + 1];
    if (l <= x && x <= h) {
      return mid;
    } else if (h < x) {
      lo = mid + 2;
    } else {
      hi = mid - 2;
    }
  }

  return -lo - 1;
}

/**
 * @param {ArrayLike<number>} buffer 
 * @param {LookupTableEncoding} value
 * @param {'' | ','} [sep = '']
 * @return {LookupTableBuffer}
 */
export function initLookupTableBuffer(buffer, value, sep = '') {
  let nums = value.split(sep).map(s => s ? parseInt(s, 36) : 0);
  for (let i = 0; i < nums.length; i++)
    /** @type Array<number> */
    (buffer)[i] = nums[i];
  return /** @type {LookupTableBuffer} */(buffer);
};

/**
 * @param {ArrayLike<number>} buffer
 * @param {UnicodeRangeEncoding} value
 * @return {UnicodeRangeBuffer}
 */
export function initUnicodeRangeBuffer(buffer, value) {
  let nums = value.split(',').map(s => s ? parseInt(s, 36) : 0);
  for (let i = 0, n = 0; i < nums.length; i++)
    /** @type Array<number> */
    (buffer)[i] = i % 2 ? n + nums[i] : (n = nums[i]);
  return /** @type {UnicodeRangeBuffer} */ (buffer);
};
