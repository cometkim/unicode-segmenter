import GraphemeSplitter from 'grapheme-splitter';
import { inputs, simpleBench } from '../../_simple-bench.js';

const graphemeSplitter = new (GraphemeSplitter.default || GraphemeSplitter)();

{
  const result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.small)];
  });

  print(`grapheme-splitter (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}


{
  const result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.medium)];
  });

  print();
  print(`grapheme-splitter (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}
