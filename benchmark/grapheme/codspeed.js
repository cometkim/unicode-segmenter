// @ts-check

import { withCodSpeed } from '@codspeed/tinybench-plugin';
import { Bench } from 'tinybench';

import {
  graphemeSegments,
  countGraphemes,
  splitGraphemes,
  collectGraphemes,
} from 'unicode-segmenter/grapheme';
import { testcases } from './_testcases.js';
import { corpora } from './_corpora.js';

const bench = withCodSpeed(new Bench());

/**
 * One factory per API, so that the function CodSpeed measures contains a single call and nothing else.
 *
 * @type {Array<[api: string, make: (input: string) => () => void]>}
 */
const apis = [
  ['graphemeSegments', input => () => { void [...graphemeSegments(input)]; }],
  ['countGraphemes', input => () => { void countGraphemes(input); }],
  ['splitGraphemes', input => () => { void [...splitGraphemes(input)]; }],
  ['collectGraphemes', input => () => { void collectGraphemes(input); }],
];

/**
 * CodSpeed's instrumented runner measures a single call after only a few warmup calls and a forced GC.
 *
 * Warm up the measured closure itself here, so that it and everything it reaches are tiered up before the measurement;
 * otherwise the result reflects interpreter performance.
 *
 * @param {() => void} run the same closure that gets measured
 * @param {number} iterations
 */
let warmup = (run, iterations) => () => {
  for (let i = 0; i < iterations; i++) run();
};

for (let [api, make] of apis) {
  for (let [name, input] of testcases) {
    let run = make(input);
    bench.add(`${api} - ${name}`, run, { beforeAll: warmup(run, 2000) });
  }
}

for (let [api, make] of apis) {
  for (let [name, input] of corpora) {
    let run = make(input);
    // A corpus is thousands of code points per call,
    // so the segmentation loop tiers up through on-stack replacement within the first few calls.
    // (measured: per-call time flattens by call ~5)
    bench.add(`${api} - corpus=${name}`, run, {
      beforeAll: warmup(run, Math.max(20, Math.ceil(3e5 / input.length))),
    });
  }
}

await bench.run();
console.table(bench.table());
