import * as core from './core.js';
import { graphemeSegments } from './grapheme.js';

/**
 * Adapter for `Intl.Segmenter` API
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 */
export class Segmenter {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter
   *
   * @typedef {'grapheme' | 'word' | 'sentence'} SegmentGranularity
   * @typedef {'lookup' | 'best fit'} MatchingStrategy
   * @typedef {{
   *   localeMatcher?: MatchingStrategy,
   *   granularity?: SegmentGranularity,
   * }} SegmenterOptions
   *
   * @param {string} locale
   * @param {SegmenterOptions} [options={}]
   */
  constructor(locale, options = {}) {
    let {
      granularity = 'grapheme',
    } = options;
    switch (granularity) {
      case 'grapheme':
        break;
      case 'word':
        throw new TypeError('Unicode "word" segmenter is currently not implemented');
      case 'sentence':
        throw new TypeError('Unicode "sentence" segmenter is currently not implemented');
      default:
        throw new RangeError(`Value ${granularity} out of range for Intl.Segmenter options property granularity`);
    }
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment
   *
   * @param {string} input
   * @return {SegmentsAdapter}
   */
  segment(input) {
    return new SegmentsAdapter(input);
  }
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment/Segments
 */
class SegmentsAdapter {
  /**
   * @param {string} input
   */
  constructor(input) {
    /** @type {string} */
    this.input = input;
  }

  [Symbol.iterator]() {
    // only grapheme segmenter is currently provided
    return graphemeSegments(this.input);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment/Segments/containing
   *
   * @param {number} codeUnitIndex
   * @return {core.SegmentOutput | undefined}
   */
  containing(codeUnitIndex) {
    let offset = 0;
    // only grapheme segmenter is currently provided
    for (let x of graphemeSegments(this.input)) {
      offset += x.segment.length;
      if (codeUnitIndex < offset) {
        return x;
      }
    }
  }
}
