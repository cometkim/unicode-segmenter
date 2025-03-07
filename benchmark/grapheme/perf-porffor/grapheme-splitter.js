import { inputs, simpleBench } from '../../_simple-bench.js';

import { GraphemeSplitter } from '../bundle-entries/grapheme-splitter.js';
let graphemeSplitter = new (GraphemeSplitter.default || GraphemeSplitter)();

{
  let result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.small)];
  });

  console.log(`grapheme-splitter (small input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`duration (avg): ${result.avgDuration}`);
  console.log();
}

{
  let result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.medium)];
  });

  console.log(`grapheme-splitter (medium input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`duration (avg): ${result.avgDuration}`);
  console.log();
}
