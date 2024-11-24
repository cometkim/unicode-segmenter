import { inputs, simpleBench } from '../../_simple-bench.js';

import { graphemeSegments } from '../bundle-entries/unicode-segmenter.js';

{
  let result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.small)];
  });

  print(`unicode-segmenter/grapheme (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
  print();
}

{
  let result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.medium)];
  });

  print(`unicode-segmenter/grapheme (medium input)`);
  print(`samples: ${result.samples}`);
  print(`medium input (avg): ${result.avgDuration}`);
  print();
}
