import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import Metro from 'metro';
import { $ } from 'zx';

let baseDir = import.meta.dirname;

$.cwd = baseDir;

let config = await Metro.loadConfig(undefined, {
  transformer: {
    enableBabelRCLookup: false,
    babelTransformerPath: '@react-native/metro-babel-transformer',
  },
  reporter: {
    update: () => {},
  },
});

let libs = [
  ['unicode-segmenter'],
  ['graphemer'],
  ['grapheme-splitter'],
  // ['@formatjs/intl-segmenter', 'formatjs-intl-segmenter'],
];

let benches = [];

console.group('Preparing bundles...');

for (let lib of libs) {
  let libDir = path.join(baseDir, lib[1] || lib[0]);

  let files = await fs.readdir(libDir);
  files = files.filter(file => file.endsWith('.js') && !file.includes('hermes'));

  for (let file of files) {
    let source = path.join(libDir, file);
    let hermesEntry = path.join(libDir, file.replace(/\.js$/, '.hermes.js'));
    let hermesBin = path.join(libDir, file.replace(/\.js$/, '.hermes.hbc'));

    await Metro.runBuild(config, {
      entry: path.join(libDir, file),
      out: hermesEntry,
      dev: false,
    });

    console.log(`Compiling bundle to ${hermesBin}`);
    await $`hermes -emit-binary -out ${hermesBin} ${hermesEntry}`;

    console.log();

    if (file === 'bench.js') {
      benches.push({
        lib,
        source,
        hermesBin,
        hermesEntry,
      });
    }
  }
}

console.groupEnd();

console.log('\nExecuting Hermes bytecodes...\n');

for (let bench of benches) {
  await $({ stdio: 'inherit' })`hermes ${bench.hermesBin}`;
  console.log();
}
