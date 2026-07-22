import { withCodSpeed } from '@codspeed/tinybench-plugin';
import { Bench } from 'tinybench';

import {
  graphemeSegments,
  countGraphemes,
  splitGraphemes,
} from 'unicode-segmenter/grapheme';
import { testcases } from './_testcases.js';

const bench = withCodSpeed(new Bench());

for (const [name, input] of testcases) {
  bench.add(`graphemeSegments - ${name}`, () => {
    void [...graphemeSegments(input)];
  }, {
    beforeAll() {
      // CodSpeed's instrumented runner measures a single call after only a
      // few warmup calls and a forced GC. Warm up enough here so the whole
      // call path gets tiered up before the measurement; otherwise the
      // result reflects interpreter performance only.
      for (let i = 0; i < 2000; i++) {
        void [...graphemeSegments(input)];
      }
    },
  });
}

for (const [name, input] of testcases) {
  bench.add(`countGraphemes - ${name}`, () => {
    void countGraphemes(input);
  }, {
    beforeAll() {
      for (let i = 0; i < 2000; i++) {
        void countGraphemes(input);
      }
    },
  });
}

for (const [name, input] of testcases) {
  bench.add(`splitGraphemes - ${name}`, () => {
    void [...splitGraphemes(input)];
  }, {
    beforeAll() {
      for (let i = 0; i < 2000; i++) {
        void [...splitGraphemes(input)];
      }
    },
  });
}

await bench.run();
console.table(bench.table());
