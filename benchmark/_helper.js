import * as zlib from 'node:zlib';
import { promisify } from 'node:util';

let gzip = promisify(zlib.gzip);
let brotli = promisify(zlib.brotliCompress);
let zstd = promisify(zlib.zstdCompress);

function byteLength(bytes, pretty = process.env.PRETTY === 'true') {
  let len = bytes;
  if (bytes instanceof Uint8Array) {
    len = bytes.byteLength;
  }
  return pretty ? prettyBytes(len) : len;
}

export async function reportBundleStats(name, bundle, minBundle) {
  return {
    name,
    'Size': byteLength(bundle),
    'Size (min)': byteLength(minBundle),
    'Size (min+gzip)': byteLength(await gzip(minBundle)),
    'Size (min+br)': byteLength(await brotli(minBundle)),
    'Size (min+zstd)': byteLength(await zstd(minBundle)),
  };
}

export async function reportWasmBindingStats(name, bundle, minBundle, wasm) {
  return {
    name,
    'Size': byteLength(bundle.byteLength + wasm.byteLength),
    'Size (min)': byteLength(minBundle.byteLength + wasm.byteLength),
    'Size (min+gzip)': byteLength((await gzip(minBundle)).byteLength + (await gzip(wasm)).byteLength),
    'Size (min+br)': byteLength((await brotli(minBundle)).byteLength + (await brotli(wasm)).byteLength),
    'Size (min+zstd)': byteLength((await zstd(minBundle)).byteLength + (await zstd(wasm)).byteLength),
  };
}

export async function reportHermesStats(name, bin) {
  return {
    name,
    'Bytecode size': byteLength(bin),
    'Bytecode size (gzip)': byteLength(await gzip(bin)),
  };
}
