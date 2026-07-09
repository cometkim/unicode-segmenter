// @ts-check

import { BND, cat, nextState } from './grapheme-core.js';
import { GraphemeCategory } from './_grapheme_data.js';

/**
 * @typedef {import('./_grapheme_data.js').GC_Any} GC_Any
 *
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryNum} GraphemeCategoryNum
 *
 * @typedef {object} GraphemeSegmentExtra
 * @property {number} _hd The first code point of the segment
 * @property {GraphemeCategoryNum} _catBegin Beginning Grapheme_Cluster_Break category of the segment
 * @property {GraphemeCategoryNum} _catEnd Ending Grapheme_Cluster_Break category of the segment
 *
 * @typedef {import('./core.js').SegmentOutput<GraphemeSegmentExtra>} GraphemeSegmentOutput
 * @typedef {import('./core.js').Segmenter<GraphemeSegmentExtra>} GraphemeSegmenter
 */

export { GraphemeCategory };

/**
 * Unicode segmentation by extended grapheme rules.
 *
 * This is fully compatible with the {@link Intl.Segmenter.segment} API
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment
 *
 * @param {string} input
 * @return {GraphemeSegmenter} iterator for grapheme cluster segments
 */
export function* graphemeSegments(input) {
  let len = input.length;
  if (len === 0) return;

  let cp = /** @type {number} */ (input.codePointAt(0));
  let cursor = cp > 0xFFFF ? 2 : 1;

  /** Category of the last consumed code point */
  let catBefore = cat(cp);

  /** Packed sequence state */
  let st = (0xC418 >> catBefore) & 1 ? nextState(0, catBefore, cp) : 0;

  /** Start index of the current segment */
  let index = 0;

  /** Head code point of the current segment */
  let hd = cp;

  /** Category of the head */
  let catBegin = catBefore;

  while (cursor < len) {
    cp = /** @type {number} */ (input.codePointAt(cursor));
    let catAfter = cat(cp);
    let boundary = BND[(catBefore << 4 | catAfter) << 5 | st];

    st = (0xC418 >> catAfter) & 1 && (st !== 0 || catAfter !== 3)
      ? nextState(st, catAfter, cp)
      : 0;

    if (boundary) {
      yield {
        segment: input.slice(index, cursor),
        index,
        input,
        _hd: hd,
        _catBegin: /** @type {GraphemeCategoryNum} */ (catBegin === 15 ? 0 : catBegin),
        _catEnd: /** @type {GraphemeCategoryNum} */ (catBefore === 15 ? 0 : catBefore),
      };
      index = cursor;
      hd = cp;
      catBegin = catAfter;
    }
    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
  }

  yield {
    segment: input.slice(index),
    index,
    input,
    _hd: hd,
    _catBegin: /** @type {GraphemeCategoryNum} */ (catBegin === 15 ? 0 : catBegin),
    _catEnd: /** @type {GraphemeCategoryNum} */ (catBefore === 15 ? 0 : catBefore),
  };
}

/**
 * Count number of extended grapheme clusters in given text.
 *
 * NOTE:
 *
 * This function is a small wrapper around {@link graphemeSegments}.
 *
 * If you call it more than once at a time, consider memoization
 * or use {@link graphemeSegments} or {@link splitGraphemes} once instead
 *
 * Or if you need fast counting, use the standalone
 * `unicode-segmenter/grapheme-counter` entry instead.
 *
 * @param {string} text
 * @return {number} count of grapheme clusters
 */
export function countGraphemes(text) {
  let count = 0;
  for (let _ of graphemeSegments(text)) count += 1;
  return count;
}

export {
  /**
   * @deprecated use {@link countGraphemes}
   */
  countGraphemes as countGrapheme,
};

/**
 * Split given text into extended grapheme clusters.
 *
 * @param {string} text
 * @return {IterableIterator<string>} iterator for grapheme clusters
 *
 * @see {@link graphemeSegments} if you need extra information.
 *
 * @example
 * [...splitGraphemes('abc')] // => ['a', 'b', 'c']
 */
export function* splitGraphemes(text) {
  for (let s of graphemeSegments(text)) yield s.segment;
}

// Keep one live segmenter and its result reachable so their hidden classes
// stay strongly referenced. Otherwise a major GC while no segmenter is
// alive clears the maps embedded weakly in JIT-optimized code, and the
// next run pays deoptimization and re-learning costs.
//
// The instances are stashed on an always-retained module object, since
// unreferenced module-scope bindings do not survive module evaluation.
{
  let keep = graphemeSegments('_');
  // @ts-ignore intended expando
  BND._keep = [keep, keep.next()];
}
