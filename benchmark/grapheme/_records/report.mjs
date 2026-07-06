import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const __dirname = import.meta.dirname;

// Libraries we're comparing, in fixed display order:
// subject first, then the native/wasm references, then JS libraries.
const LIBRARIES = [
  'unicode-segmenter/grapheme',
  'Intl.Segmenter',
  'unicode-rs/unicode-segmentation (wasm)',
  'graphemer',
  'grapheme-splitter',
  '@formatjs/intl-segmenter',
];

const SHORT_NAMES = {
  'unicode-segmenter/grapheme': 'unicode-segmenter',
  'graphemer': 'graphemer',
  'grapheme-splitter': 'grapheme-splitter',
  '@formatjs/intl-segmenter': '@formatjs/intl-segmenter',
  'unicode-rs/unicode-segmentation (wasm)': 'unicode-segmentation (wasm)',
  'Intl.Segmenter': 'Intl.Segmenter',
};

const SUBJECT = 'unicode-segmenter/grapheme';

// Benchmark scenarios
const SCENARIOS = [
  'Lorem ipsum (ascii)',
  'Emojis',
  'Hindi',
  'Demonic characters',
  'Tweet text (combined)',
  'Code snippet (combined)',
];

// Parse time value to microseconds
function parseTime(timeStr) {
  const match = timeStr.trim().match(/^([\d',._]+)\s*(ns|µs|ms|s)/i);
  if (!match) return null;

  const value = parseFloat(match[1].replace(/['_,]/g, ''));
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'ns': return value / 1000;
    case 'µs': return value;
    case 'ms': return value * 1000;
    case 's': return value * 1000000;
    default: return value;
  }
}

// Parse a benchmark record file
async function parseBenchmarkFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const filename = basename(filePath, '.txt');

  // Filename: YYYYMMDD-cpu-os-runtime.txt
  const parts = filename.split('-');
  const date = parts[0];
  const cpu = parts[1];
  const os = parts[2];
  const runtime = parts.slice(3).join('-').replace(/-\d+$/, ''); // strip trailing commit hash

  const results = {
    date,
    cpu,
    os,
    runtime,
    filename,
    scenarios: {},
  };

  let currentScenario = null;

  for (const line of lines) {
    const scenarioMatch = line.match(/^•\s+(.+)$/);
    if (scenarioMatch) {
      currentScenario = scenarioMatch[1].trim();
      results.scenarios[currentScenario] = {};
      continue;
    }

    if (!currentScenario) continue;

    for (const lib of LIBRARIES) {
      const matched = line.startsWith(lib)
        || (lib.includes('wasm') && /^unicode-rs\//.test(line));
      if (!matched) continue;

      const timeMatch = line.match(/(\d[\d',._]*\s*(?:ns|µs|ms|s)\/iter)/i);
      if (timeMatch) {
        const time = parseTime(timeMatch[1]);
        if (time !== null) {
          results.scenarios[currentScenario][lib] = time;
        }
      }
      break;
    }
  }

  return results;
}

function formatCpu(cpu) {
  if (cpu === 'apple_m1_pro') return 'Apple M1 Pro';
  if (cpu === 'apple_m4_pro') return 'Apple M4 Pro';
  if (cpu === 'intel_x86_64') return 'Intel x86_64';
  return cpu.replace(/_/g, ' ');
}

function formatRuntime(runtime) {
  const formatted = runtime.replace(/_/g, ' ');
  return formatted
    .replace(/^nodejs/, 'Node.js')
    .replace(/^node/, 'Node.js')
    .replace(/^bun/, 'Bun')
    .replace(/^chrome/, 'Chrome')
    .replace(/^firefox/, 'Firefox')
    .replace(/^safari/, 'Safari');
}

function formatDate(yyyymmdd) {
  return yyyymmdd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
}

function formatTime(us) {
  if (us < 1) return `${(us * 1000).toFixed(0)} ns`;
  if (us < 100) return `${us.toFixed(2)} µs`;
  if (us < 1000) return `${us.toFixed(1)} µs`;
  return `${(us / 1000).toFixed(2)} ms`;
}

// Build the embedded data model
function buildModel(allResults) {
  const cpuOrder = { apple_m4_pro: 0, apple_m1_pro: 1, intel_x86_64: 2 };
  const runtimeOrder = { nodejs: 0, bun: 1, chrome: 2, firefox: 3, safari: 4 };

  const byPlatform = new Map();
  for (const result of allResults) {
    const family = result.runtime.split('_')[0];
    const key = `${result.cpu}/${family}`;
    if (!byPlatform.has(key)) {
      byPlatform.set(key, {
        id: key,
        cpu: result.cpu,
        family,
        label: `${formatCpu(result.cpu)} · ${formatRuntime(family)}`,
        records: [],
      });
    }
    byPlatform.get(key).records.push(result);
  }

  const platforms = [...byPlatform.values()]
    .sort((a, b) => {
      const c = (cpuOrder[a.cpu] ?? 99) - (cpuOrder[b.cpu] ?? 99);
      if (c !== 0) return c;
      return (runtimeOrder[a.family] ?? 99) - (runtimeOrder[b.family] ?? 99);
    })
    .map(platform => {
      const records = platform.records.sort((a, b) => a.date.localeCompare(b.date));
      const latest = records[records.length - 1];
      return {
        id: platform.id,
        label: platform.label,
        latest: {
          date: formatDate(latest.date),
          runtime: formatRuntime(latest.runtime),
          scenarios: latest.scenarios,
        },
        // subject-only history for the trend view
        history: records.map(r => ({
          date: formatDate(r.date),
          runtime: formatRuntime(r.runtime),
          scenarios: Object.fromEntries(
            SCENARIOS.flatMap(s => {
              const t = r.scenarios[s]?.[SUBJECT];
              return t == null ? [] : [[s, t]];
            }),
          ),
        })),
      };
    });

  return {
    generated: new Date().toLocaleDateString('sv-SE'),
    subject: SUBJECT,
    libraries: LIBRARIES,
    shortNames: SHORT_NAMES,
    scenarios: SCENARIOS,
    platforms,
  };
}

// Generate the self-contained HTML report.
//
// Visual language follows the data-viz reference palette; the categorical
// slots below were validated for both modes (CVD separation, lightness band,
// chroma, contrast) with the six-checks validator. Sub-3:1 slots rely on the
// legend, tooltips, and the table views as relief channels.
function generateHTML(model) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>unicode-segmenter benchmark report</title>
<style>
  :root {
    --surface-1: #fcfcfb;
    --plane: #f9f9f7;
    --text-primary: #0b0b0b;
    --text-secondary: #52514e;
    --text-muted: #898781;
    --grid: #e1e0d9;
    --axis: #c3c2b7;
    --border: rgba(11, 11, 11, 0.10);
    --accent: #2a78d6;      /* subject bars, series 1 */
    --deemph: #a5a49c;      /* context bars */
    --good: #006300;
    --bad: #d03b3b;
    --s1: #2a78d6; --s2: #1baf7a; --s3: #eda100;
    --s4: #008300; --s5: #4a3aa7; --s6: #e34948;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --surface-1: #1a1a19;
      --plane: #0d0d0d;
      --text-primary: #ffffff;
      --text-secondary: #c3c2b7;
      --text-muted: #898781;
      --grid: #2c2c2a;
      --axis: #383835;
      --border: rgba(255, 255, 255, 0.10);
      --accent: #3987e5;
      --deemph: #5c5b56;
      --good: #0ca30c;
      --bad: #e66767;
      --s1: #3987e5; --s2: #199e70; --s3: #c98500;
      --s4: #008300; --s5: #9085e9; --s6: #e66767;
    }
  }
  * { box-sizing: border-box; }
  html { background: var(--plane); }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    color: var(--text-primary);
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 24px 48px;
    line-height: 1.45;
  }
  header h1 { font-size: 22px; margin: 0; }
  header p { color: var(--text-secondary); margin: 4px 0 0; font-size: 14px; }
  h2 { font-size: 16px; margin: 40px 0 4px; }
  .section-note { color: var(--text-muted); font-size: 13px; margin: 0 0 16px; }

  .filters {
    display: flex; align-items: center; gap: 10px;
    margin: 24px 0 8px;
    font-size: 14px; color: var(--text-secondary);
  }
  .filters select {
    font: inherit; color: var(--text-primary);
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    min-width: 260px;
  }
  .filters .meta { color: var(--text-muted); font-size: 13px; }

  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 12px; margin: 12px 0 8px;
  }
  .kpi {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
  }
  .kpi .label { font-size: 13px; color: var(--text-secondary); }
  .kpi .value { font-size: 30px; font-weight: 600; margin-top: 2px; }
  .kpi .note { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 14px;
  }
  figure.card {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 10px;
    margin: 0; padding: 14px 16px 10px;
    min-width: 0;
  }
  .card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  .card-head h3 { font-size: 14px; margin: 0 0 8px; font-weight: 600; }
  .view-toggle { display: inline-flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; flex: none; }
  .view-toggle button {
    font: inherit; font-size: 11px; padding: 2px 8px; margin: 0;
    background: transparent; color: var(--text-muted);
    border: 0; cursor: pointer;
  }
  .view-toggle button[aria-pressed="true"] { background: var(--grid); color: var(--text-primary); }
  figure.card svg { display: block; width: 100%; height: auto; }
  figure.card .tablewrap { overflow-x: auto; }

  table.data {
    border-collapse: collapse; width: 100%;
    font-size: 13px;
  }
  table.data th, table.data td {
    text-align: right; padding: 6px 10px;
    border-bottom: 1px solid var(--grid);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  table.data th:first-child, table.data td:first-child { text-align: left; }
  table.data thead th { color: var(--text-secondary); font-weight: 600; border-bottom: 1px solid var(--axis); }
  table.data td.subject { font-weight: 600; }
  table.data .up { color: var(--good); }
  table.data .down { color: var(--bad); }

  .legend { display: flex; flex-wrap: wrap; gap: 6px 10px; margin: 8px 0 12px; }
  .legend button {
    font: inherit; font-size: 12px;
    display: inline-flex; align-items: center; gap: 6px;
    color: var(--text-secondary);
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 3px 10px; cursor: pointer;
  }
  .legend button .key { width: 14px; height: 0; border-top: 3px solid; border-radius: 2px; }
  .legend button[aria-pressed="false"] { opacity: 0.35; }

  #tooltip {
    position: fixed; z-index: 10; pointer-events: none;
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    padding: 8px 10px; font-size: 12px;
    max-width: 320px; display: none;
  }
  #tooltip .t-title { color: var(--text-muted); margin-bottom: 4px; }
  #tooltip .t-row { display: flex; align-items: center; gap: 6px; margin: 2px 0; }
  #tooltip .t-key { width: 12px; height: 0; border-top: 3px solid; border-radius: 2px; flex: none; }
  #tooltip .t-val { font-weight: 600; font-variant-numeric: tabular-nums; }
  #tooltip .t-lib { color: var(--text-secondary); }

  svg text { font-family: inherit; }
  .bar-row:focus { outline: none; }
  .bar-row:focus-visible rect.hit { stroke: var(--accent); stroke-width: 2; }
  footer { margin-top: 40px; color: var(--text-muted); font-size: 12px; border-top: 1px solid var(--grid); padding-top: 12px; }
  footer code { font-family: ui-monospace, monospace; }
</style>
</head>
<body>
<header>
  <h1>unicode-segmenter benchmark report</h1>
  <p>Grapheme segmentation, six workloads × six implementations. Longer bars are better (throughput). Generated ${model.generated} from the records in this directory.</p>
</header>

<div class="filters">
  <label for="platform">Platform</label>
  <select id="platform"></select>
  <span class="meta" id="platform-meta"></span>
</div>

<div class="kpis" id="kpis"></div>

<h2>Latest comparison</h2>
<p class="section-note">Throughput per workload; <span style="border-bottom: 3px solid var(--accent)">unicode-segmenter</span> highlighted against the alternatives. Hover or focus a row for exact numbers.</p>
<div class="grid" id="scenario-grid"></div>

<figure class="card" style="margin-top:14px">
  <div class="card-head"><h3>How much faster is unicode-segmenter?</h3></div>
  <div class="tablewrap" id="speedup-table"></div>
</figure>

<h2>unicode-segmenter over time</h2>
<p class="section-note">Throughput of unicode-segmenter across archived records for the selected platform. Runtime versions vary between records; the tooltip shows each record's runtime.</p>
<div class="legend" id="trend-legend"></div>
<figure class="card">
  <div class="card-head">
    <h3 id="trend-title">Performance history</h3>
    <div class="view-toggle" data-for="trend"></div>
  </div>
  <div id="trend-chart"></div>
  <div class="tablewrap" id="trend-table" hidden></div>
</figure>
<figure class="card" style="margin-top:14px" id="trend-delta-card" hidden>
  <div class="card-head"><h3>First record vs latest</h3></div>
  <div class="tablewrap" id="trend-delta"></div>
</figure>

<footer>
  Regenerate with <code>node benchmark/grapheme/_records/report.mjs</code> after adding a record.
  Sources: mitata outputs named <code>YYYYMMDD-cpu-os-runtime.txt</code>.
</footer>

<div id="tooltip" role="status"></div>

<script>
const DATA = ${JSON.stringify(model)};

const SUBJECT = DATA.subject;
const SVGNS = 'http://www.w3.org/2000/svg';
const SERIES_VARS = ['--s1', '--s2', '--s3', '--s4', '--s5', '--s6'];

const fmt = {
  time(us) {
    if (us < 1) return (us * 1000).toFixed(0) + ' ns';
    if (us < 100) return us.toFixed(2) + ' µs';
    if (us < 1000) return us.toFixed(1) + ' µs';
    return (us / 1000).toFixed(2) + ' ms';
  },
  ops(us) {
    const ops = 1e6 / us;
    if (ops >= 1e6) return (ops / 1e6).toFixed(2) + 'M ops/s';
    if (ops >= 1e3) return Math.round(ops / 1e3) + 'K ops/s';
    return Math.round(ops) + ' ops/s';
  },
  axisOps(ops) {
    if (ops >= 1e6) return (ops / 1e6) + 'M';
    if (ops >= 1e3) return (ops / 1e3) + 'K';
    return String(ops);
  },
  ratio(r) {
    return (r >= 10 ? r.toFixed(0) : r.toFixed(1)) + '×';
  },
};

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
}
function svgEl(tag, attrs = {}, text) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
}

// clean tick steps: 1/2/5 × 10^n covering [0, max] with ~n ticks
function ticks(max, count) {
  const raw = max / count;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map(m => m * pow).find(s => max / s <= count) || 10 * pow;
  const out = [];
  for (let v = 0; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

// ---- tooltip ----
const tooltip = document.getElementById('tooltip');
function showTooltip(x, y, build) {
  tooltip.replaceChildren();
  build(tooltip);
  tooltip.style.display = 'block';
  const rect = tooltip.getBoundingClientRect();
  const px = Math.min(x + 14, window.innerWidth - rect.width - 8);
  const py = Math.min(y + 14, window.innerHeight - rect.height - 8);
  tooltip.style.left = Math.max(8, px) + 'px';
  tooltip.style.top = Math.max(8, py) + 'px';
}
function hideTooltip() {
  tooltip.style.display = 'none';
}

// ---- per-scenario emphasis bar chart ----
function renderScenarioCard(scenario, data) {
  const rows = DATA.libraries.filter(lib => data[lib] != null);
  const card = el('figure', { class: 'card' });
  const head = el('div', { class: 'card-head' });
  head.append(el('h3', {}, scenario));
  const toggle = el('div', { class: 'view-toggle' });
  head.append(toggle);
  card.append(head);

  const chartHost = el('div');
  const tableHost = el('div', { class: 'tablewrap', hidden: '' });
  card.append(chartHost, tableHost);

  const subjectTime = data[SUBJECT];

  // chart geometry
  const W = 584, gutter = 192, band = 30, barH = 20;
  const axisBand = 22, topPad = 4;
  const H = topPad + rows.length * band + axisBand;
  const plotW = W - gutter - 96; // room for tip labels
  const maxOps = Math.max(...rows.map(lib => 1e6 / data[lib]));
  const x = ops => (ops / maxOps) * plotW;

  const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group' });
  svg.append(svgEl('title', {}, scenario + ' — throughput by library'));

  // gridlines + axis labels (recessive hairlines, clean steps)
  for (const t of ticks(maxOps, 4)) {
    const gx = gutter + x(t);
    svg.append(svgEl('line', {
      x1: gx, y1: topPad, x2: gx, y2: topPad + rows.length * band,
      stroke: t === 0 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': 1,
    }));
    svg.append(svgEl('text', {
      x: gx, y: H - 6, 'text-anchor': 'middle',
      'font-size': 10.5, fill: 'var(--text-muted)',
    }, fmt.axisOps(t)));
  }

  rows.forEach((lib, i) => {
    const time = data[lib];
    const ops = 1e6 / time;
    const y = topPad + i * band;
    const isSubject = lib === SUBJECT;
    const w = Math.max(2, x(ops));
    const color = isSubject ? 'var(--accent)' : 'var(--deemph)';

    const g = svgEl('g', { class: 'bar-row', tabindex: 0, role: 'img' });
    g.append(svgEl('title', {},
      DATA.shortNames[lib] + ': ' + fmt.ops(time) + ', ' + fmt.time(time) + ' per iteration'));

    // y label: identity via text, not color
    const label = svgEl('text', {
      x: gutter - 8, y: y + band / 2 + 3.5, 'text-anchor': 'end',
      'font-size': 11.5, fill: isSubject ? 'var(--text-primary)' : 'var(--text-secondary)',
      'font-weight': isSubject ? 600 : 400,
    }, DATA.shortNames[lib]);

    // bar: square at baseline, 4px rounded data-end
    const r = Math.min(4, w);
    const bar = svgEl('path', {
      d: 'M' + (gutter + 0.5) + ' ' + (y + (band - barH) / 2)
        + ' h' + (w - r) + ' a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r
        + ' v' + (barH - 2 * r) + ' a' + r + ' ' + r + ' 0 0 1 -' + r + ' ' + r
        + ' h-' + (w - r) + ' Z',
      fill: color,
    });

    // value at the tip
    const tip = svgEl('text', {
      x: gutter + w + 6, y: y + band / 2 + 3.5,
      'font-size': 11.5, fill: 'var(--text-secondary)',
      'font-variant-numeric': 'tabular-nums',
    }, fmt.ops(time));

    // row-sized hit target (larger than the mark)
    const hit = svgEl('rect', {
      class: 'hit', x: 0, y, width: W, height: band,
      fill: 'transparent',
    });

    const overlay = svgEl('rect', {
      x: gutter, y: y + (band - barH) / 2, width: w, height: barH,
      fill: 'currentColor', opacity: 0, 'pointer-events': 'none',
    });

    const buildTip = (root) => {
      root.append(el('div', { class: 't-title' }, scenario));
      const r1 = el('div', { class: 't-row' });
      const key = el('span', { class: 't-key' });
      key.style.borderTopColor = isSubject
        ? getComputedStyle(document.documentElement).getPropertyValue('--accent')
        : getComputedStyle(document.documentElement).getPropertyValue('--deemph');
      r1.append(key, el('span', { class: 't-val' }, fmt.ops(time) + ' · ' + fmt.time(time) + '/iter'));
      root.append(r1);
      root.append(el('div', { class: 't-lib' }, DATA.shortNames[lib]));
      if (!isSubject && subjectTime) {
        root.append(el('div', { class: 't-lib' }, fmt.ratio(time / subjectTime) + ' slower than unicode-segmenter'));
      }
    };
    const enter = () => { overlay.setAttribute('opacity', 0.14); };
    const leave = () => { overlay.setAttribute('opacity', 0); hideTooltip(); };
    g.addEventListener('pointermove', e => { enter(); showTooltip(e.clientX, e.clientY, buildTip); });
    g.addEventListener('pointerleave', leave);
    g.addEventListener('focus', () => {
      enter();
      const b = g.getBoundingClientRect();
      showTooltip(b.right - 80, b.top, buildTip);
    });
    g.addEventListener('blur', leave);

    g.append(hit, label, bar, overlay, tip);
    svg.append(g);
  });

  chartHost.append(svg);

  // table twin
  const table = el('table', { class: 'data' });
  const thead = el('thead');
  const hr = el('tr');
  ['Library', 'Throughput', 'Time/iter', 'vs unicode-segmenter'].forEach(h => hr.append(el('th', {}, h)));
  thead.append(hr);
  const tbody = el('tbody');
  for (const lib of rows) {
    const time = data[lib];
    const tr = el('tr');
    tr.append(el('td', lib === SUBJECT ? { class: 'subject' } : {}, DATA.shortNames[lib]));
    tr.append(el('td', {}, fmt.ops(time)));
    tr.append(el('td', {}, fmt.time(time)));
    tr.append(el('td', {}, lib === SUBJECT ? '—' : fmt.ratio(time / subjectTime) + ' slower'));
    tbody.append(tr);
  }
  table.append(thead, tbody);
  tableHost.append(table);

  makeToggle(toggle, chartHost, tableHost);
  return card;
}

function makeToggle(host, chartHost, tableHost) {
  const bChart = el('button', { type: 'button', 'aria-pressed': 'true' }, 'Chart');
  const bTable = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Table');
  const set = table => {
    bChart.setAttribute('aria-pressed', String(!table));
    bTable.setAttribute('aria-pressed', String(table));
    chartHost.hidden = table;
    tableHost.hidden = !table;
  };
  bChart.addEventListener('click', () => set(false));
  bTable.addEventListener('click', () => set(true));
  host.append(bChart, bTable);
}

// ---- KPI tiles ----
function geomean(values) {
  const v = values.filter(x => x != null && isFinite(x));
  if (!v.length) return null;
  return Math.exp(v.reduce((a, x) => a + Math.log(x), 0) / v.length);
}

function renderKpis(platform) {
  const host = document.getElementById('kpis');
  host.replaceChildren();
  const scen = platform.latest.scenarios;

  const ratiosTo = lib => DATA.scenarios.map(s => {
    const d = scen[s];
    return d && d[lib] != null && d[SUBJECT] != null ? d[lib] / d[SUBJECT] : null;
  });
  const jsAlts = ['graphemer', 'grapheme-splitter', '@formatjs/intl-segmenter'];
  const fastestAltRatios = DATA.scenarios.map(s => {
    const d = scen[s];
    if (!d || d[SUBJECT] == null) return null;
    const times = jsAlts.map(l => d[l]).filter(t => t != null);
    return times.length ? Math.min(...times) / d[SUBJECT] : null;
  });
  const wins = DATA.scenarios.filter(s => {
    const d = scen[s];
    if (!d || d[SUBJECT] == null) return false;
    return Object.entries(d).every(([lib, t]) => lib === SUBJECT || t >= d[SUBJECT]);
  }).length;
  const total = DATA.scenarios.filter(s => scen[s] && scen[s][SUBJECT] != null).length;

  const tiles = [
    ['vs Intl.Segmenter', geomean(ratiosTo('Intl.Segmenter')), 'built-in segmenter'],
    ['vs unicode-segmentation', geomean(ratiosTo('unicode-rs/unicode-segmentation (wasm)')), 'Rust, WASM binding'],
    ['vs fastest JS alternative', geomean(fastestAltRatios), 'best of graphemer, grapheme-splitter, @formatjs'],
  ];
  for (const [label, value, note] of tiles) {
    if (value == null) continue;
    const tile = el('div', { class: 'kpi' });
    tile.append(el('div', { class: 'label' }, label));
    tile.append(el('div', { class: 'value' }, fmt.ratio(value) + ' faster'));
    tile.append(el('div', { class: 'note' }, 'geometric mean across workloads · ' + note));
    host.append(tile);
  }
  const winTile = el('div', { class: 'kpi' });
  winTile.append(el('div', { class: 'label' }, 'Fastest implementation in'));
  winTile.append(el('div', { class: 'value' }, wins + ' / ' + total));
  winTile.append(el('div', { class: 'note' }, 'workloads on this platform'));
  host.append(winTile);
}

// ---- speedup summary table ----
function renderSpeedupTable(platform) {
  const host = document.getElementById('speedup-table');
  host.replaceChildren();
  const scen = platform.latest.scenarios;
  const others = DATA.libraries.filter(l => l !== SUBJECT);

  const table = el('table', { class: 'data' });
  const thead = el('thead');
  const hr = el('tr');
  hr.append(el('th', {}, 'Workload'));
  hr.append(el('th', {}, 'unicode-segmenter'));
  for (const lib of others) hr.append(el('th', {}, DATA.shortNames[lib]));
  thead.append(hr);
  const tbody = el('tbody');
  for (const s of DATA.scenarios) {
    const d = scen[s];
    if (!d || d[SUBJECT] == null) continue;
    const tr = el('tr');
    tr.append(el('td', {}, s));
    tr.append(el('td', { class: 'subject' }, fmt.time(d[SUBJECT])));
    for (const lib of others) {
      tr.append(el('td', {}, d[lib] == null ? '—' : fmt.ratio(d[lib] / d[SUBJECT]) + ' slower'));
    }
    tbody.append(tr);
  }
  table.append(thead, tbody);
  host.append(table);
}

// ---- trend line chart ----
const hiddenScenarios = new Set();

function renderTrendLegend() {
  const host = document.getElementById('trend-legend');
  host.replaceChildren();
  DATA.scenarios.forEach((s, i) => {
    const b = el('button', { type: 'button', 'aria-pressed': String(!hiddenScenarios.has(s)) });
    const key = el('span', { class: 'key' });
    key.style.borderTopColor = 'var(' + SERIES_VARS[i] + ')';
    b.append(key, document.createTextNode(s));
    b.addEventListener('click', () => {
      if (hiddenScenarios.has(s)) hiddenScenarios.delete(s);
      else hiddenScenarios.add(s);
      b.setAttribute('aria-pressed', String(!hiddenScenarios.has(s)));
      renderTrend(currentPlatform());
    });
    host.append(b);
  });
}

function renderTrend(platform) {
  const host = document.getElementById('trend-chart');
  host.replaceChildren();
  const points = platform.history;
  document.getElementById('trend-title').textContent =
    'Performance history — ' + platform.label + ' (' + points.length + ' record' + (points.length === 1 ? '' : 's') + ')';

  const W = 960, H = 340;
  const m = { top: 12, right: 48, bottom: 34, left: 64 };
  const plotW = W - m.left - m.right, plotH = H - m.top - m.bottom;

  const dates = points.map(p => p.date);
  const xs = dates.map(d => new Date(d + 'T00:00:00Z').getTime());
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const xPos = t => xs.length === 1
    ? m.left + plotW / 2
    : m.left + ((t - xMin) / (xMax - xMin)) * plotW;

  const visible = DATA.scenarios.filter(s => !hiddenScenarios.has(s));
  const allOps = points.flatMap(p => visible.map(s => p.scenarios[s]).filter(t => t != null).map(t => 1e6 / t));
  if (!allOps.length) {
    host.append(el('p', { class: 'section-note' }, 'No visible series — enable a workload in the legend.'));
    return;
  }
  const maxOps = Math.max(...allOps);
  const yPos = ops => m.top + plotH - (ops / maxOps) * plotH;

  const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group' });
  svg.append(svgEl('title', {}, 'unicode-segmenter throughput per record, ' + platform.label));

  // horizontal gridlines + y ticks
  for (const t of ticks(maxOps, 4)) {
    const gy = yPos(t);
    svg.append(svgEl('line', {
      x1: m.left, y1: gy, x2: W - m.right, y2: gy,
      stroke: t === 0 ? 'var(--axis)' : 'var(--grid)', 'stroke-width': 1,
    }));
    svg.append(svgEl('text', {
      x: m.left - 8, y: gy + 3.5, 'text-anchor': 'end',
      'font-size': 10.5, fill: 'var(--text-muted)', 'font-variant-numeric': 'tabular-nums',
    }, fmt.axisOps(t) + (t === 0 ? ' ops/s' : '')));
  }
  // x tick labels (dates, dedup by position)
  const seenX = new Set();
  points.forEach((p, i) => {
    const px = Math.round(xPos(xs[i]));
    if (seenX.has(px)) return;
    seenX.add(px);
    svg.append(svgEl('text', {
      x: px, y: H - 10, 'text-anchor': 'middle',
      'font-size': 10.5, fill: 'var(--text-muted)', 'font-variant-numeric': 'tabular-nums',
    }, p.date));
  });

  // series lines + markers (2px lines, >=8px markers with surface ring)
  visible.forEach(s => {
    const idx = DATA.scenarios.indexOf(s);
    const color = 'var(' + SERIES_VARS[idx] + ')';
    const coords = points
      .map((p, i) => p.scenarios[s] == null ? null : [xPos(xs[i]), yPos(1e6 / p.scenarios[s])])
      .filter(Boolean);
    if (coords.length > 1) {
      svg.append(svgEl('path', {
        d: 'M' + coords.map(c => c[0].toFixed(1) + ' ' + c[1].toFixed(1)).join(' L'),
        fill: 'none', stroke: color, 'stroke-width': 2,
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }));
    }
    for (const [cx, cy] of coords) {
      svg.append(svgEl('circle', {
        cx, cy, r: 4.5, fill: color,
        stroke: 'var(--surface-1)', 'stroke-width': 2,
      }));
    }
  });

  // crosshair + shared tooltip
  const hair = svgEl('line', {
    y1: m.top, y2: m.top + plotH,
    stroke: 'var(--axis)', 'stroke-width': 1, visibility: 'hidden',
  });
  svg.append(hair);
  const overlay = svgEl('rect', {
    x: m.left, y: m.top, width: plotW, height: plotH, fill: 'transparent',
  });
  overlay.addEventListener('pointermove', e => {
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0, best = Infinity;
    xs.forEach((t, i) => {
      const d = Math.abs(xPos(t) - mx);
      if (d < best) { best = d; nearest = i; }
    });
    const p = points[nearest];
    const px = xPos(xs[nearest]);
    hair.setAttribute('x1', px);
    hair.setAttribute('x2', px);
    hair.setAttribute('visibility', 'visible');
    showTooltip(e.clientX, e.clientY, root => {
      root.append(el('div', { class: 't-title' }, p.date + ' · ' + p.runtime));
      for (const s of visible) {
        const t = p.scenarios[s];
        if (t == null) continue;
        const row = el('div', { class: 't-row' });
        const key = el('span', { class: 't-key' });
        key.style.borderTopColor = getComputedStyle(document.documentElement)
          .getPropertyValue(SERIES_VARS[DATA.scenarios.indexOf(s)]);
        row.append(key, el('span', { class: 't-val' }, fmt.ops(t)));
        row.append(el('span', { class: 't-lib' }, s));
        root.append(row);
      }
    });
  });
  overlay.addEventListener('pointerleave', () => {
    hair.setAttribute('visibility', 'hidden');
    hideTooltip();
  });
  svg.append(overlay);
  host.append(svg);

  renderTrendTables(platform);
}

function renderTrendTables(platform) {
  const points = platform.history;

  // table twin: date x scenario
  const host = document.getElementById('trend-table');
  host.replaceChildren();
  const table = el('table', { class: 'data' });
  const thead = el('thead');
  const hr = el('tr');
  hr.append(el('th', {}, 'Record'), el('th', {}, 'Runtime'));
  for (const s of DATA.scenarios) hr.append(el('th', {}, s));
  thead.append(hr);
  const tbody = el('tbody');
  for (const p of points) {
    const tr = el('tr');
    tr.append(el('td', {}, p.date), el('td', {}, p.runtime));
    for (const s of DATA.scenarios) {
      tr.append(el('td', {}, p.scenarios[s] == null ? '—' : fmt.time(p.scenarios[s])));
    }
    tbody.append(tr);
  }
  table.append(thead, tbody);
  host.append(table);

  // first vs latest delta
  const deltaCard = document.getElementById('trend-delta-card');
  const deltaHost = document.getElementById('trend-delta');
  deltaHost.replaceChildren();
  if (points.length < 2) {
    deltaCard.hidden = true;
    return;
  }
  deltaCard.hidden = false;
  const first = points[0], last = points[points.length - 1];
  const dtable = el('table', { class: 'data' });
  const dthead = el('thead');
  const dhr = el('tr');
  ['Workload', first.date + ' (' + first.runtime + ')', last.date + ' (' + last.runtime + ')', 'Change'].forEach(h => dhr.append(el('th', {}, h)));
  dthead.append(dhr);
  const dtbody = el('tbody');
  for (const s of DATA.scenarios) {
    const a = first.scenarios[s], b = last.scenarios[s];
    if (a == null || b == null) continue;
    const change = (a - b) / a * 100;
    const tr = el('tr');
    tr.append(el('td', {}, s));
    tr.append(el('td', {}, fmt.time(a)));
    tr.append(el('td', {}, fmt.time(b)));
    tr.append(el('td', { class: change >= 0 ? 'up' : 'down' },
      (change >= 0 ? '↑ ' : '↓ ') + Math.abs(change).toFixed(1) + '% ' + (change >= 0 ? 'faster' : 'slower')));
    dtbody.append(tr);
  }
  dtable.append(dthead, dtbody);
  deltaHost.append(dtable);
}

// ---- platform wiring ----
const select = document.getElementById('platform');
DATA.platforms.forEach((p, i) => {
  select.append(el('option', { value: String(i) }, p.label));
});
function currentPlatform() {
  return DATA.platforms[Number(select.value) || 0];
}
function renderAll() {
  const platform = currentPlatform();
  document.getElementById('platform-meta').textContent =
    'latest record: ' + platform.latest.date + ' · ' + platform.latest.runtime;
  renderKpis(platform);

  const grid = document.getElementById('scenario-grid');
  grid.replaceChildren();
  for (const s of DATA.scenarios) {
    const d = platform.latest.scenarios[s];
    if (d && Object.keys(d).length) grid.append(renderScenarioCard(s, d));
  }
  renderSpeedupTable(platform);
  renderTrend(platform);
}
select.addEventListener('change', renderAll);

// trend view toggle
makeToggle(
  document.querySelector('.view-toggle[data-for="trend"]'),
  document.getElementById('trend-chart'),
  document.getElementById('trend-table'),
);

renderTrendLegend();
renderAll();
</script>
</body>
</html>`;
}

// Main
const files = await readdir(__dirname);
const txtFiles = files.filter(f => f.endsWith('.txt')).sort();

const allResults = [];
for (const file of txtFiles) {
  allResults.push(await parseBenchmarkFile(join(__dirname, file)));
}
allResults.sort((a, b) => a.date.localeCompare(b.date));

const model = buildModel(allResults);

// compact console summary: latest record per platform
console.log(`${txtFiles.length} records, ${model.platforms.length} platforms\n`);
for (const platform of model.platforms) {
  console.log(`${platform.label} — ${platform.latest.date} (${platform.latest.runtime})`);
  const rows = [];
  for (const scenario of SCENARIOS) {
    const d = platform.latest.scenarios[scenario];
    if (!d || d[SUBJECT] == null) continue;
    const vsIntl = d['Intl.Segmenter'] != null ? (d['Intl.Segmenter'] / d[SUBJECT]).toFixed(2) + 'x' : '—';
    rows.push({
      workload: scenario,
      'unicode-segmenter': formatTime(d[SUBJECT]),
      'vs Intl': vsIntl,
    });
  }
  console.table(rows);
}

const htmlPath = join(__dirname, 'report.generated.html');
await writeFile(htmlPath, generateHTML(model));
console.log(`HTML report generated: ${htmlPath}`);
