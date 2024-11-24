import { inputs, simpleBench } from '../../_simple-bench.js';

import { Graphemer } from '../bundle-entries/graphemer.bundle.js';
let graphemer = new (Graphemer.default || Graphemer)();

{
  let result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.small)];
  });

  print(`graphemer (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
  print();
}


{
  let result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.medium)];
  });

  print(`graphemer (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
  print();
}
