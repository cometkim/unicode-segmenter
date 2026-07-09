import {
  group,
  summary,
  barplot,
  bench,
  run,
  do_not_optimize,
} from 'mitata';

import { countGraphemes } from '../../src/grapheme.js';
import { countGraphemes as countGraphemesFast } from '../../src/grapheme-counter.js';
import { testcases } from './_testcases.js';

// Node.js, Deno, Bun
const isSystemRuntime = typeof process === 'object' || typeof Deno === 'object' && typeof Bun === 'object';
const isWebWorker = !isSystemRuntime && typeof self === 'object';

for (const [title, input] of testcases) {
  group(title, () => {
    summary(() => {
      barplot(() => {
        bench('grapheme-counter', () => {
          do_not_optimize(countGraphemesFast(input));
        }).gc('inner').baseline(true);

        bench('grapheme', () => {
          do_not_optimize(countGraphemes(input));
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
