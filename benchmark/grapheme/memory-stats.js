// @ts-check

import { memoryBenchmark } from '../_memory.js';
import { testcases } from './_testcases.js';

/**
 * @param {Iterable<unknown>} iterable
 */
function drain(iterable) {
  for (let _ of iterable);
}

/** @type {Record<string, import('../_memory.js').LibAdapter>} */
let libs = {
  'unicode-segmenter/grapheme': async () => {
    let { graphemeSegments } = await import('unicode-segmenter/grapheme');
    return input => drain(graphemeSegments(input));
  },
  'graphemer': async () => {
    let mod = /** @type {any} */ (await import('graphemer'));
    let graphemer = new (mod.default.default || mod.default)();
    return input => drain(graphemer.iterateGraphemes(input));
  },
  'grapheme-splitter': async () => {
    let mod = /** @type {any} */ (await import('grapheme-splitter'));
    let graphemeSplitter = new (mod.default.default || mod.default)();
    return input => drain(graphemeSplitter.iterateGraphemes(input));
  },
  '@formatjs/intl-segmenter': async () => {
    let mod = /** @type {any} */ (await import('@formatjs/intl-segmenter/segmenter.js'));
    let segmenter = new mod.Segmenter();
    return input => drain(segmenter.segment(input));
  },
  // Only the JS bindings are visible below; WASM linear memory is
  // allocated outside both columns.
  'unicode-segmentation (wasm-bindgen)': async () => {
    let unicodeSegmentation = await import('unicode-segmentation-wasm');
    return input => void unicodeSegmentation.collect(input);
  },
  // Native implementation; its Unicode data lives in the C++ side of the
  // runtime and is not visible to either column.
  'Intl.Segmenter': async () => {
    let segmenter = new Intl.Segmenter();
    return input => drain(segmenter.segment(input));
  },
};

await memoryBenchmark(libs, testcases.map(t => t[1]));
