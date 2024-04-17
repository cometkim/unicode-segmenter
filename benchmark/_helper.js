import * as zlib from 'node:zlib';
import { promisify } from 'node:util';

let gzip = promisify(zlib.gzip);
let brotli = promisify(zlib.brotliCompress);

function byteLength(bytes) {
  let len = bytes.byteLength;
  return process.env.PRETTY === 'true' ? prettyBytes(len) : len;
}

export async function reportBundleStats(name, bundle, minBundle) {
  return {
    name,
    'Size': byteLength(bundle),
    'Size (min)': byteLength(minBundle),
    'Size (min+gzip)': byteLength(await gzip(minBundle)),
    'Size (min+br)': byteLength(await brotli(minBundle)),
  };
}
