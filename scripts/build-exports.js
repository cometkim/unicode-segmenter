import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import { build } from 'esbuild';

let rootDir = path.join(import.meta.dirname, '..');
let srcDir = path.join(rootDir, 'src');
let distDir = path.join(rootDir, 'dist');
let bundleDir = path.join(distDir, 'bundle');

fs.mkdir(distDir, { recursive: true });

let src = name => path.join(srcDir, name);
let dist = name => path.join(distDir, name);
let bundle = name => path.join(bundleDir, name);

let modules = await fs.readdir(srcDir);

async function unescapeCodePoints(file) {
  let content = await fs.readFile(file, 'utf8');
  content = content.replace(/(\\u\{?[0-9a-zA-Z]+\}?)/g, (_match, group) => {
    return eval(`"${group}"`);
  });
  await fs.writeFile(file, content, 'utf8');
}

{
  await build({
    entryPoints: modules.map(src),
    outdir: distDir,
    outExtension: { '.js': '.js' },
    format: 'esm',
    treeShaking: true,
    write: true,
  });
  await build({
    entryPoints: modules.map(src),
    outdir: distDir,
    outExtension: { '.js': '.cjs' },
    format: 'cjs',
    treeShaking: true,
    write: true,
  });
  for (let file of await fs.readdir(distDir)) {
    if (file.startsWith('_')) {
      await unescapeCodePoints(dist(file));
    }
  }
}

{
  await build({
    bundle: true,
    entryPoints: [
      src('grapheme.js'),
      src('intl-adapter.js'),
      src('intl-polyfill.js'),
    ],
    outdir: bundleDir,
    outExtension: { '.js': '.js' },
    format: 'esm',
    treeShaking: true,
    write: true,
  });
  await build({
    bundle: true,
    entryPoints: [
      src('grapheme.js'),
      src('intl-adapter.js'),
      src('intl-polyfill.js'),
    ],
    outdir: bundleDir,
    outExtension: { '.js': '.min.js' },
    format: 'esm',
    minify: true,
    treeShaking: true,
    write: true,
  });
  for (let file of await fs.readdir(bundleDir)) {
    await unescapeCodePoints(bundle(file));
  }
}
