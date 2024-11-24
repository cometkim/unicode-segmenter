import { inputs, simpleBench } from '../../_simple-bench.js';

import { GraphemeSplitter } from '../bundle-entries/grapheme-splitter.js';
let graphemeSplitter = new (GraphemeSplitter.default || GraphemeSplitter)();

{
  let result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.small)];
  });

  print(`grapheme-splitter (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
  print();
}

{
  let result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.medium)];
  });

  print(`grapheme-splitter (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
  print();
}
