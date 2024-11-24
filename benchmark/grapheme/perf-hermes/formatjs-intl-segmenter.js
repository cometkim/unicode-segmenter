import { Segmenter } from '@formatjs/intl-segmenter/src/segmenter.js';
import { inputs, simpleBench } from '../../_simple-bench.js';

const segmenter = new Segmenter();

{
  const result = simpleBench(1000, () => {
    void [...segmenter.segment(inputs.small)];
  });

  print(`@formatjs/intl-segmenter (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}


{
  const result = simpleBench(1000, () => {
    void [...segmenter.segment(inputs.medium)];
  });

  print();
  print(`@formatjs/intl-segmenter (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}
