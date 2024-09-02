import entry from './entry.js';
import { inputs, simpleBench } from '../suite.js';

let graphemer = entry;

{
  let result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.small)];
  });

  print(`graphemer (small input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}


{
  let result = simpleBench(1000, () => {
    void [...graphemer.iterateGraphemes(inputs.medium)];
  });

  print();
  print(`graphemer (medium input)`);
  print(`samples: ${result.samples}`);
  print(`duration (avg): ${result.avgDuration}`);
}
