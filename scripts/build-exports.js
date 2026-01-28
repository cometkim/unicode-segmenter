import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { spawn } from 'node:child_process';

import { transformFileAsync } from '@babel/core';
import { build } from 'esbuild';

let rootDir = path.join(import.meta.dirname, '..');
let srcDir = path.join(rootDir, 'src');
let distDir = path.join(rootDir, '');
let bundleDir = path.join(distDir, 'bundle');

await fs.mkdir(distDir, { recursive: true });

let src = name => path.join(srcDir, name);
let dist = name => path.join(distDir, name);
let modules = await fs.readdir(srcDir);

function rewriteCjs(content) {
  return content.replace(/require\("(.*)\.js"\)/g, (_match, id) => {
    return `require("${id}.cjs")`;
  });
}

{
  // use source modules as is
  console.log('Copying source files...');
  await Promise.all(
    modules.map(
      module => fs.copyFile(src(module), dist(module)),
    ),
  );

  console.log('Transforming CommonJS entries...');
  await Promise.all(
    modules.map(
      async module => {
        const result = await transformFileAsync(dist(module), {
          plugins: [
            ['@babel/plugin-transform-modules-commonjs', {
              loose: true,
              strict: true,
              lazy: false,
              importInterop: 'none',
            }],
          ],
          assumptions: {
            enumerableModuleMeta: true,
            constantReexports: true,
          },
        });
        await fs.writeFile(
          dist(module).replace('.js', '.cjs'),
          rewriteCjs(result.code),
        );
      },
    ),
  );
  // let { outputFiles: cjsOutputs } = await build({
  //   entryPoints: modules.map(dist),
  //   outdir: distDir,
  //   bundle: false,
  //   outExtension: { '.js': '.cjs' },
  //   format: 'cjs',
  //   platform: 'node',
  //   write: false,
  //   sourcemap: true,
  // });
  // await Promise.all(
  //   cjsOutputs.map(
  //     ({ path, text }) => fs.writeFile(path, rewriteCjs(text), 'utf8'),
  //   ),
  // );
}

{
  console.log('Build browser bundles...');

  let bundleEntryPoints = [
    src('index.js'),
    src('emoji.js'),
    src('general.js'),
    src('grapheme.js'),
    src('intl-adapter.js'),
    src('intl-polyfill.js'),
  ];
  await build({
    bundle: true,
    entryPoints: bundleEntryPoints,
    outdir: bundleDir,
    outExtension: { '.js': '.js' },
    format: 'esm',
    treeShaking: true,
    write: true,
    sourcemap: false,
  });
  await build({
    bundle: true,
    entryPoints: bundleEntryPoints,
    outdir: bundleDir,
    outExtension: { '.js': '.min.js' },
    format: 'esm',
    minify: true,
    treeShaking: true,
    write: true,
    sourcemap: false,
  });
}

if (process.argv.includes('--no-tsc')) {
  process.exit(0);
}

{
  console.log('Building type declarations...');
  const { promise, resolve, reject } = Promise.withResolvers();
  spawn(
    'yarn',
    ['tsc', '-p', 'tsconfig.build.json'],
    { cwd: rootDir, stdio: 'inherit', shell: process.platform === 'win32' }
  )
    .on('error', reject)
    .on('close', resolve);

  const exitCode = await promise;
  if (exitCode !== 0) {
    process.exit(exitCode);
  }

  console.log('Copying declaration files for CommonJS...');
  for await (const file of fs.glob('*.d.ts', { cwd: rootDir })) {
    // Expected they have the same content, but this is still required for TypeScript's Node16 resolution.
    await fs.copyFile(dist(file), dist(file.replace('.d.ts', '.d.cts')));
  }
}
