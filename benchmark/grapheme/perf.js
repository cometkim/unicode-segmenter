import * as assert from 'node:assert/strict';
import {
  group,
  summary,
  barplot,
  bench,
  run,
  do_not_optimize,
} from 'mitata';

import Graphemer from 'graphemer';
import GraphemeSplitter from 'grapheme-splitter';
import * as unicodeSegmentation from 'unicode-segmentation-wasm';
import { Segmenter as FormatjsSegmenter } from '@formatjs/intl-segmenter/segmenter.js';

import { graphemeSegments } from '../../src/grapheme.js';
import { testcases } from './_testcases.js';

// Node.js, Deno, Bun
const isSystemRuntime = typeof process === 'object' || typeof Deno === 'object' && typeof Bun === 'object';
const isWebWorker = !isSystemRuntime && typeof self === 'object';

if (isWebWorker) {
  // Init WASM module
  await unicodeSegmentation.default();
}

const intlSegmenter = new Intl.Segmenter();
const graphemer = new (Graphemer.default || Graphemer)();
const graphemeSplitter = new (GraphemeSplitter.default || GraphemeSplitter)();
const formatjsSegmenter = new FormatjsSegmenter();


for (const [title, input] of testcases) {
  const expected = [...intlSegmenter.segment(input)].map(({ segment }) => segment);

  if (isSystemRuntime) {
    assert.deepEqual([...graphemeSegments(input)].map(({ segment }) => segment), expected);
    assert.deepEqual([...formatjsSegmenter.segment(input)].map(({ segment }) => segment), expected);

    // They don't support Unicode 15.1
    // assert.deepEqual([...graphemer.iterateGraphemes(input)], expected);
    // assert.deepEqual([...graphemeSplitter.iterateGraphemes(input)], expected);
    // assert.deepEqual([...unicodeSegmentation.collect(input)], expected);
  }

  group(title, () => {
    summary(() => {
      barplot(() => {
        bench('unicode-segmenter/grapheme', () => {
          do_not_optimize([...graphemeSegments(input)]);
        }).gc('inner').baseline(true);

        bench('graphemer', () => {
          do_not_optimize([...graphemer.iterateGraphemes(input)]);
        }).gc('inner');

        bench('grapheme-splitter', () => {
          do_not_optimize([...graphemeSplitter.iterateGraphemes(input)]);
        }).gc('inner');

        bench('@formatjs/intl-segmenter', () => {
          do_not_optimize([...formatjsSegmenter.segment(input)]);
        }).gc('inner');

        bench('unicode-rs/unicode-segmentation (wasm-bindgen)', () => {
          do_not_optimize(unicodeSegmentation.collect(input));
        }).gc('inner');

        bench('Intl.Segmenter', () => {
          do_not_optimize([...intlSegmenter.segment(input)]);
        }).gc('inner');
      });
    });
  });
}

await run({
  format: (!isWebWorker && process.env.MITATA_FORMAT) || 'mitata',
  ...isWebWorker && {
    colors: false,
    print(s) {
      self.postMessage({ type: 'log', message: s });
    },
  },
  ...isSystemRuntime && {
    colors: !process.env.NO_COLOR,
  },
});

if (isWebWorker) {
  self.postMessage({ type: 'done' });
}
