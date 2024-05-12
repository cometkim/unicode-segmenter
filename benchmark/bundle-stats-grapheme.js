import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { build } from 'esbuild';

import { reportBundleStats } from './_helper.js';

let baseDir = import.meta.dirname;
let rootDir = path.join(baseDir, '..');
let distDir = path.join(rootDir, '.');
let bundleDir = path.join(distDir, 'bundle');

let bundle = name => path.join(bundleDir, name);

if (!existsSync(bundleDir)) {
  throw new Error(`run \`yarn build\` first!`);
}

let myEntry = await reportBundleStats(
  'unicode-segmenter/grapheme',
  await fs.readFile(bundle('grapheme.js')),
  await fs.readFile(bundle('grapheme.min.js')),
);

let competitors = [
  'graphemer',
  'grapheme-splitter',
];

let otherEntries = await Promise.all(
  competitors.map(async (lib) => {
    let result = await build({
      write: false,
      bundle: true,
      entryPoints: [path.join(baseDir, `bundle-entry-${lib}.js`)],
    });
    let minResult = await build({
      write: false,
      bundle: true,
      minify: true,
      entryPoints: [path.join(baseDir, `bundle-entry-${lib}.js`)],
    });
    return await reportBundleStats(
      lib,
      result.outputFiles[0].contents,
      minResult.outputFiles[0].contents,
    );
  }),
);

console.table([
  myEntry,
  ...otherEntries,
]);
