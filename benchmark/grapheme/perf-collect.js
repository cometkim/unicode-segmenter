import {
  group,
  summary,
  barplot,
  bench,
  run,
  do_not_optimize,
} from 'mitata';

import {
  splitGraphemes,
  collectGraphemes,
} from '../../src/grapheme.js';
import { testcases } from './_testcases.js';

// Node.js, Deno, Bun
const isSystemRuntime = typeof process === 'object' || typeof Deno === 'object' && typeof Bun === 'object';
const isWebWorker = !isSystemRuntime && typeof self === 'object';

const intlSegmenter = new Intl.Segmenter();

for (const [title, input] of testcases) {
  group(title, () => {
    summary(() => {
      barplot(() => {
        bench('unicode-segmenter (collect)', () => {
          do_not_optimize(collectGraphemes(input));
        }).gc('inner').baseline(true);

        bench('unicode-segmenter (split)', () => {
          do_not_optimize([...splitGraphemes(input)]);
        }).gc('inner');

        bench('Intl.Segmenter (naive)', () => {
          do_not_optimize([...intlSegmenter.segment(input)].map(s => s.segment));
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
