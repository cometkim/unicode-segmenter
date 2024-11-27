import { graphemeSegments } from '../../src/grapheme.js';
import { inputs, simpleBench } from './suite.js';

{
  let result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.small)];
  });

  console.log(`unicode-segmenter/grapheme (small input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`duration (avg): ${result.avgDuration}`);
}

{
  let result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.medium)];
  });

  console.log()
  console.log(`unicode-segmenter/grapheme (medium input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`duration (avg): ${result.avgDuration}`);
}
