import Graphemer from 'graphemer';
import { inputs, simpleBench } from './_suite.js';

const graphemer = new (Graphemer.default || Graphemer)();

{
  const result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.small)];
  });

  print(`graphemer (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}


{
  const result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.medium)];
  });

  print();
  print(`graphemer (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}

