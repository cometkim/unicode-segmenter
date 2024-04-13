import * as path from 'node:path';
import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as zlib from 'node:zlib';
import { promisify } from 'node:util';

import { build } from 'esbuild';
import prettyBytes from 'pretty-bytes';

let gzip = promisify(zlib.gzip);
let brotli = promisify(zlib.brotliCompress);

let baseDir = import.meta.dirname;
let rootDir = path.join(baseDir, '..');
let distDir = path.join(rootDir, '.');
let bundleDir = path.join(distDir, 'bundle');

let bundle = name => path.join(bundleDir, name);

if (!existsSync(bundleDir)) {
  throw new Error(`run \`yarn build\` first!`);
}

function byteLength(bytes) {
  let len = bytes.byteLength;
  return process.env.PRETTY === 'true' ? prettyBytes(len) : len;
}

async function reportEntry(name, bundle, minBundle) {
  return {
    name,
    'Size': byteLength(bundle),
    'Size (min)': byteLength(minBundle),
    'Size (min+gzip)': byteLength(await gzip(minBundle)),
    'Size (min+br)': byteLength(await brotli(minBundle)),
  };
}

let myEntry = await reportEntry(
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
    return await reportEntry(
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
