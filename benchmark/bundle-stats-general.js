import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

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
  'unicode-segmenter/general',
  await fs.readFile(bundle('general.js')),
  await fs.readFile(bundle('general.min.js')),
);

let otherEntries = [];

console.table([
  myEntry,
  ...otherEntries,
]);
