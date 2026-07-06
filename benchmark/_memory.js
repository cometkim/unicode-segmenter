// @ts-check

import { spawn } from 'node:child_process';
import prettyBytes from 'pretty-bytes';

/**
 * @typedef {() => Promise<(input: string) => void>} LibAdapter
 *   Loads a library and returns a function exercising it on an input.
 *
 * @typedef {object} MemorySample
 * @property {number} initMs
 * @property {number} heapImport JS heap retained right after load
 * @property {number} heapUse JS heap retained after workload runs
 * @property {number} externalUse external + ArrayBuffer memory after workload runs
 */

const RESULT_MARKER = '__MEMORY_BENCH_RESULT__';

/**
 * Measure retained memory of each library, one fresh process per sample.
 *
 * The parent respawns this same script with `MEMORY_BENCH_TARGET` set, so
 * libraries never share a heap, JIT state, or interned strings.
 *
 * @param {Record<string, LibAdapter>} adapters
 * @param {string[]} workload
 * @param {object} [options]
 * @param {number} [options.samples=5] processes per library, median reported
 * @param {number} [options.uses=10] workload repetitions per process
 */
export async function memoryBenchmark(adapters, workload, options = {}) {
  let { samples = 5, uses = 10 } = options;

  let target = process.env.MEMORY_BENCH_TARGET;
  if (target) {
    let adapter = adapters[target];
    if (!adapter) {
      throw new Error(`unknown memory benchmark target: ${target}`);
    }
    let sample = await measure(adapter, workload, uses);
    console.log(RESULT_MARKER + JSON.stringify(sample));
    return;
  }

  let report = [];
  for (let name of Object.keys(adapters)) {
    /** @type {MemorySample[]} */
    let runs = [];
    for (let i = 0; i < samples; i++) {
      runs.push(await runSample(name));
    }
    report.push({
      name,
      'Init (ms)': median(runs.map(r => r.initMs)).toFixed(2),
      'Heap (import)': size(median(runs.map(r => r.heapImport))),
      'Heap (after use)': size(median(runs.map(r => r.heapUse))),
      'External (after use)': size(median(runs.map(r => r.externalUse))),
    });
  }
  console.table(report);
}

/**
 * @param {LibAdapter} adapter
 * @param {string[]} workload
 * @param {number} uses
 * @return {Promise<MemorySample>}
 */
async function measure(adapter, workload, uses) {
  let m0 = gcStable();

  let t0 = performance.now();
  let run = await adapter();
  let initMs = performance.now() - t0;
  let m1 = gcStable();

  for (let i = 0; i < uses; i++) {
    for (let input of workload) {
      run(input);
    }
  }
  let m2 = gcStable();

  return {
    initMs,
    heapImport: m1.heapUsed - m0.heapUsed,
    heapUse: m2.heapUsed - m0.heapUsed,
    externalUse: (m2.external + m2.arrayBuffers) - (m0.external + m0.arrayBuffers),
  };
}

/**
 * Collect garbage until the heap size settles, so retained sizes are
 * comparable between runs.
 */
function gcStable() {
  let gc = globalThis.gc;
  if (!gc) {
    throw new Error('run with --expose-gc');
  }
  let last = Infinity;
  for (let i = 0; i < 10; i++) {
    gc();
    let { heapUsed } = process.memoryUsage();
    if (last - heapUsed < 4096) break;
    last = heapUsed;
  }
  return process.memoryUsage();
}

/**
 * @param {string} name
 * @return {Promise<MemorySample>}
 */
function runSample(name) {
  return new Promise((resolve, reject) => {
    let child = spawn(
      process.execPath,
      ['--expose-gc', process.argv[1]],
      {
        env: { ...process.env, MEMORY_BENCH_TARGET: name },
        stdio: ['ignore', 'pipe', 'inherit'],
      },
    );
    let stdout = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.on('error', reject);
    child.on('close', code => {
      let line = stdout.split('\n').find(l => l.startsWith(RESULT_MARKER));
      if (code !== 0 || !line) {
        reject(new Error(`memory sample for ${name} failed (exit ${code})\n${stdout}`));
      } else {
        resolve(JSON.parse(line.slice(RESULT_MARKER.length)));
      }
    });
  });
}

/**
 * @param {number[]} values
 */
function median(values) {
  let sorted = values.toSorted((a, b) => a - b);
  return sorted[sorted.length >> 1];
}

/**
 * @param {number} bytes
 */
function size(bytes, pretty = process.env.PRETTY === 'true') {
  return pretty ? prettyBytes(bytes) : Math.round(bytes);
}
