// @ts-check

import { graphemeSegments } from './grapheme.js';

/**
 * Adapter for `Intl.Segmenter` API
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
 */
export class Segmenter {
  /**
   * @param {string} [locale]
   * @param {Intl.SegmenterOptions} [options={}]
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
 * @implements {Intl.Segments}
 */
class SegmentsAdapter {
  /**
   * @param {string} input
   */
  constructor(input) {
    /** @type {string} */
    this.input = input;
  }

  /**
   * @return {IterableIterator<Intl.SegmentData>}
   */
  *[Symbol.iterator]() {
    // only grapheme segmenter is currently provided
    for (let { segment, index, input } of graphemeSegments(this.input)) {
      yield { segment, index, input };
    }
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment/Segments/containing
   *
   * @param {number} codeUnitIndex
   * @return {ReturnType<Intl.Segments["containing"]>} A resolved segment data
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
    // FIXME mistyped upstream
    // See https://github.com/microsoft/TypeScript/pull/58084
    // @ts-ignore `Segments.prototype.containing()` can actually returns `undefined`.
    return undefined;
  }
}
