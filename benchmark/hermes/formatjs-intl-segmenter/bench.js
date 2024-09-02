import entry from './entry.js';
import { inputs, simpleBench } from '../suite.js';

let segmenter = entry;

{
  let result = simpleBench(1000, () => {
    void [...segmenter.segment(inputs.small)];
  });

  print(`@formatjs/intl-segmenter (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}


{
  let result = simpleBench(1000, () => {
    void [...segmenter.segment(inputs.medium)];
  });

  print();
  print(`@formatjs/intl-segmenter (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}
