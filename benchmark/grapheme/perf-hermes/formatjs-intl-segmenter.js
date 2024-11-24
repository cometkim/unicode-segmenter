import { inputs, simpleBench } from '../../_simple-bench.js';

import { Segmenter } from '../bundle-entries/formatjs-intl-segmenter.js';
let segmenter = new Segmenter();

{
  let result = simpleBench(1000, () => {
    void [...segmenter.segment(inputs.small)];
  });

  print(`@formatjs/intl-segmenter (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
  print();
}

{
  let result = simpleBench(1000, () => {
    void [...segmenter.segment(inputs.medium)];
  });

  print(`@formatjs/intl-segmenter (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
  print();
}
