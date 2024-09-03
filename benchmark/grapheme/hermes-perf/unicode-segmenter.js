import { graphemeSegments } from '../../../src/grapheme.js';
import { inputs, simpleBench } from './_suite.js';

{
  const result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.small)];
  });

  print(`unicode-segmenter/grapheme (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}

{
  const result = simpleBench(1000, () => {
    void [...graphemeSegments(inputs.medium)];
  });

  print();
  print(`unicode-segmenter/grapheme (medium input)`);
  print(`samples: ${result.samples}`);
  print(`medium input (avg): ${result.avgDuration}`);
}
