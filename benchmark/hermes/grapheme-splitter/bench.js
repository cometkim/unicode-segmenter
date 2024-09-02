import entry from './entry.js';
import { inputs, simpleBench } from '../suite.js';

let graphemeSplitter = entry;

{
  let result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.small)];
  });

  print(`grapheme-splitter (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}


{
  let result = simpleBench(1000, () => {
    void [...graphemeSplitter.iterateGraphemes(inputs.medium)];
  });

  print();
  print(`grapheme-splitter (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}
