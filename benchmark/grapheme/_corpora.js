// @ts-check

import { readFileSync } from 'node:fs';

/**
 * Large real-world inputs for the CodSpeed baseline suites,
 * reusing the fixtures from `test/_corpora` (see its README for provenance and counts).
 *
 * The shared testcases in `_testcases.js` are short by design.
 *
 * They are what the comparison benchmarks quote, so they mostly measure call overhead.
 * These corpora are thousands of code points each, which is where the segmentation loop itself dominates,
 * and there is one per distinct path so that a regression in any of them has somewhere to show up:
 *
 * - `udhr_eng` - Latin only: the `T0` lookup with the state machine idle
 * - `udhr_cmn_hans` — CJK ideographs, resolved without a table lookup
 * - `udhr_kor` - Hangul syllables (GB6, GB7, GB8)
 * - `udhr_hin` - Devanagari: 744 viramas and 3.5k marks, so GB9c and GB9a
 * - `udhr_mal` - Malayalam: the only corpus carrying both ZWNJ and ZWJ inside conjuncts, where GB9c gets suppressed
 * - `emoji_test_sequences` - 3.7k ZWJ and 8.7k pictographic (GB11), plus the flag pairs (GB12, GB13) and every skin-tone modifier
 *
 * @type {[name: string, input: string][]}
 */
export const corpora = [
  'udhr_eng',
  'udhr_cmn_hans',
  'udhr_kor',
  'udhr_hin',
  'udhr_mal',
  'emoji_test_sequences',
].map(name => {
  let text = readFileSync(
    new URL(`../../test/_corpora/${name}.txt`, import.meta.url),
    'utf-8',
  );
  // The fixtures carry an ASCII provenance header.
  // It is deliberate coverage for the conformance test,
  // but here it would dilute the script under measurement, so only the body is benchmarked.
  return /** @type {[string, string]} */ ([name, text.replace(/^(?:#[^\n]*\n)+\n?/, '')]);
});
