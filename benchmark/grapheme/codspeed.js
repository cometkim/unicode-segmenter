import { withCodSpeed } from '@codspeed/tinybench-plugin';
import { Bench } from 'tinybench';

import { graphemeSegments } from '../../src/grapheme.js';
import { testcases } from './_testcases.js';

const bench = withCodSpeed(new Bench());

for (const [name, input] of testcases) {
  bench.add(`grapheme - ${name}`, () => {
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

await bench.run();
console.table(bench.table());
