import { inputs, simpleBench } from '../../_simple-bench.js';

import { graphemeSegments } from '../bundle-entries/unicode-segmenter.js';

{
  let result = simpleBench(10000, () => {
    void [...graphemeSegments(inputs.small)];
  });

  console.log(`unicode-segmenter/grapheme (small input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`duration (avg): ${result.avgDuration}`);
  console.log();
}

{
  let result = simpleBench(10000, () => {
    void [...graphemeSegments(inputs.medium)];
  });

  console.log(`unicode-segmenter/grapheme (medium input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`medium input (avg): ${result.avgDuration}`);
  console.log();
}
