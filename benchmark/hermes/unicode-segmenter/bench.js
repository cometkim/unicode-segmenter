import entry from './entry.js';
import { inputs, simpleBench } from '../suite.js';

let { graphemeSegments } = entry;

{
  let result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.small)];
  });

  print(`unicode-segmenter/grapheme (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}

{
  let result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.medium)];
  });

  print();
  print(`unicode-segmenter/grapheme (medium input)`);
  print(`samples: ${result.samples}`);
  print(`medium input (avg): ${result.avgDuration}`);
}
