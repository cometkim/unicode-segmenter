import { inputs, simpleBench } from '../../_simple-bench.js';

import { Graphemer } from '../bundle-entries/graphemer.js';
let graphemer = new (Graphemer.default || Graphemer)();

{
  let result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.small)];
  });

  console.log(`graphemer (small input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`duration (avg): ${result.avgDuration}`);
  console.log();
}


{
  let result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.medium)];
  });

  console.log(`graphemer (medium input)`);
  console.log(`samples: ${result.samples}`);
  console.log(`duration (avg): ${result.avgDuration}`);
  console.log();
}
