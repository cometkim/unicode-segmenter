import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const __dirname = import.meta.dirname;

// Libraries we're comparing
const LIBRARIES = [
  'unicode-segmenter/grapheme',
  'graphemer',
  'grapheme-splitter',
  '@formatjs/intl-segmenter',
  'unicode-rs/unicode-segmentation (wasm)',
  'Intl.Segmenter',
];

// Short names for display
const SHORT_NAMES = {
  'unicode-segmenter/grapheme': 'unicode-segmenter',
  'graphemer': 'graphemer',
  'grapheme-splitter': 'grapheme-splitter',
  '@formatjs/intl-segmenter': '@formatjs/intl-segmenter',
  'unicode-rs/unicode-segmentation (wasm)': 'unicode-segmentation (wasm)',
  'Intl.Segmenter': 'Intl.Segmenter',
};

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
  timeStr = timeStr.trim();

  // Handle formats like "3.71 µs/iter", "6'365 ns/iter", "150 µs/iter"
  const match = timeStr.match(/^([\d',._]+)\s*(ns|µs|ms|s)/i);
  if (!match) return null;

  let value = parseFloat(match[1].replace(/['_,]/g, ''));
  const unit = match[2].toLowerCase();

  // Convert to microseconds
  switch (unit) {
    case 'ns': return value / 1000;
    case 'µs': return value;
    case 'ms': return value * 1000;
    case 's': return value * 1000000;
    default: return value;
  }
}

// Parse a benchmark file
async function parseBenchmarkFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const filename = basename(filePath, '.txt');

  // Parse filename: YYYYMMDD-cpu-os-runtime.txt
  const parts = filename.split('-');
  const date = parts[0];
  const cpu = parts[1];
  const os = parts[2];
  const runtime = parts.slice(3).join('-').replace(/-\d+$/, ''); // Remove trailing commit hash

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
    // Detect scenario headers like "• Lorem ipsum (ascii)"
    const scenarioMatch = line.match(/^•\s+(.+)$/);
    if (scenarioMatch) {
      currentScenario = scenarioMatch[1].trim();
      results.scenarios[currentScenario] = {};
      continue;
    }

    if (!currentScenario) continue;

    // Try to match benchmark result lines
    // Format 1 (newer mitata): "unicode-segmenter/grapheme                       3.71 µs/iter"
    // Format 2 (older): "unicode-segmenter/grapheme                    6'365 ns/iter"
    for (const lib of LIBRARIES) {
      if (line.startsWith(lib)) {
        // Extract the time part
        const timeMatch = line.match(/(\d[\d',._]*\s*(?:ns|µs|ms|s)\/iter)/i);
        if (timeMatch) {
          const time = parseTime(timeMatch[1]);
          if (time !== null) {
            results.scenarios[currentScenario][lib] = time;
          }
        }
        break;
      }
      // Handle wasm variant
      if (lib.includes('wasm') && line.includes('wasm')) {
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
  }

  return results;
}

// Format runtime for display
function formatRuntime(runtime) {
  // Replace underscores with spaces first, then format runtime names
  const formatted = runtime.replace(/_/g, ' ');
  if (formatted.includes('node')) return formatted.replace('nodejs', 'Node.js').replace('node', 'Node.js');
  if (formatted.includes('bun')) return formatted.replace('bun', 'Bun');
  if (formatted.includes('chrome')) return formatted.replace('chrome', 'Chrome');
  if (formatted.includes('firefox')) return formatted.replace('firefox', 'Firefox');
  if (formatted.includes('safari')) return formatted.replace('safari', 'Safari');
  return formatted;
}

// Format CPU for display
function formatCpu(cpu) {
  if (cpu === 'apple_m1_pro') return 'Apple M1 Pro';
  if (cpu === 'apple_m4_pro') return 'Apple M4 Pro';
  if (cpu === 'intel_x86_64') return 'Intel x86_64';
  return cpu;
}

// Generate ASCII bar chart
function generateBarChart(data, maxWidth = 50) {
  const maxValue = Math.max(...Object.values(data).filter(v => v != null));
  const lines = [];

  for (const [name, value] of Object.entries(data)) {
    if (value == null) continue;
    const shortName = SHORT_NAMES[name] || name;
    const barLength = Math.round((value / maxValue) * maxWidth);
    const bar = '█'.repeat(Math.max(1, barLength));
    const label = shortName.padEnd(18);
    const valueStr = formatTime(value).padStart(12);
    lines.push(`${label} ${bar} ${valueStr}`);
  }

  return lines.join('\n');
}

// Format time for display
function formatTime(us) {
  if (us < 1) return `${(us * 1000).toFixed(2)} ns`;
  if (us < 1000) return `${us.toFixed(2)} µs`;
  return `${(us / 1000).toFixed(2)} ms`;
}

// Generate trend table HTML
function generateTrendTable(platform) {
  const first = platform.dataPoints[0];
  const last = platform.dataPoints[platform.dataPoints.length - 1];

  const rows = SCENARIOS.map(scenario => {
    const firstVal = first?.scenarios[scenario];
    const lastVal = last?.scenarios[scenario];
    if (!firstVal || !lastVal) return '';

    const change = ((firstVal - lastVal) / firstVal * 100);
    const changeClass = change > 0 ? 'improvement-positive' : change < 0 ? 'improvement-negative' : '';
    const changeSymbol = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    const changeText = change > 0 ? 'faster' : change < 0 ? 'slower' : '';

    return `
      <tr>
        <td>${scenario}</td>
        <td>${formatTime(firstVal)}</td>
        <td>${formatTime(lastVal)}</td>
        <td class="${changeClass}">${changeSymbol} ${Math.abs(change).toFixed(1)}% ${changeText}</td>
      </tr>
    `;
  }).join('');

  return `
    <h3>Performance Changes</h3>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Scenario</th>
          <th>First (${first?.dateFormatted})</th>
          <th>Latest (${last?.dateFormatted})</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Generate trend data for unicode-segmenter over time
function generateTrendData(allResults) {
  // Group results by platform (cpu + runtime type)
  const byPlatform = {};

  for (const result of allResults) {
    const runtimeType = result.runtime.split('_')[0];
    const key = `${result.cpu}-${runtimeType}`;

    if (!byPlatform[key]) {
      byPlatform[key] = {
        cpu: result.cpu,
        runtime: runtimeType,
        label: `${formatCpu(result.cpu)} / ${formatRuntime(runtimeType)}`,
        dataPoints: [],
      };
    }

    // Get unicode-segmenter times for each scenario
    const dataPoint = {
      date: result.date,
      dateFormatted: result.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
      scenarios: {},
    };

    for (const scenario of SCENARIOS) {
      const data = result.scenarios[scenario];
      if (data && data['unicode-segmenter/grapheme'] != null) {
        dataPoint.scenarios[scenario] = data['unicode-segmenter/grapheme'];
      }
    }

    if (Object.keys(dataPoint.scenarios).length > 0) {
      byPlatform[key].dataPoints.push(dataPoint);
    }
  }

  // Sort data points by date
  for (const platform of Object.values(byPlatform)) {
    platform.dataPoints.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Sort platforms: by CPU (Apple M4 Pro, Apple M1 Pro, Intel) then by runtime (Node.js, Bun, Chrome, Firefox, Safari)
  const cpuOrder = { 'apple_m4_pro': 0, 'apple_m1_pro': 1, 'intel_x86_64': 2 };
  const runtimeOrder = { 'nodejs': 0, 'bun': 1, 'chrome': 2, 'firefox': 3, 'safari': 4 };

  // Filter platforms with at least 1 data point for trends, then sort
  return Object.values(byPlatform)
    .filter(p => p.dataPoints.length >= 1)
    .sort((a, b) => {
      const cpuA = cpuOrder[a.cpu] ?? 99;
      const cpuB = cpuOrder[b.cpu] ?? 99;
      if (cpuA !== cpuB) return cpuA - cpuB;
      const rtA = runtimeOrder[a.runtime] ?? 99;
      const rtB = runtimeOrder[b.runtime] ?? 99;
      return rtA - rtB;
    });
}

// Generate HTML visualization
function generateHTML(allResults) {
  // Group by runtime type
  const byRuntime = {};
  for (const result of allResults) {
    const runtimeType = result.runtime.split('_')[0];
    if (!byRuntime[runtimeType]) byRuntime[runtimeType] = [];
    byRuntime[runtimeType].push(result);
  }

  // Get latest results per runtime+cpu combo
  const latestResults = [];
  const seen = new Set();
  const sortedResults = [...allResults].sort((a, b) => b.date.localeCompare(a.date));

  for (const result of sortedResults) {
    const key = `${result.cpu}-${result.runtime.split('_')[0]}`;
    if (!seen.has(key)) {
      seen.add(key);
      latestResults.push(result);
    }
  }

  // Sort platforms: by CPU (Apple M4 Pro, Apple M1 Pro, Intel) then by runtime (Node.js, Bun, Chrome, Firefox, Safari)
  const cpuOrder = { 'apple_m4_pro': 0, 'apple_m1_pro': 1, 'intel_x86_64': 2 };
  const runtimeOrder = { 'nodejs': 0, 'bun': 1, 'chrome': 2, 'firefox': 3, 'safari': 4 };
  latestResults.sort((a, b) => {
    const cpuA = cpuOrder[a.cpu] ?? 99;
    const cpuB = cpuOrder[b.cpu] ?? 99;
    if (cpuA !== cpuB) return cpuA - cpuB;
    const rtA = runtimeOrder[a.runtime.split('_')[0]] ?? 99;
    const rtB = runtimeOrder[b.runtime.split('_')[0]] ?? 99;
    return rtA - rtB;
  });

  // Generate trend data
  const trendData = generateTrendData(allResults);

  const colors = {
    'unicode-segmenter/grapheme': '#22c55e',
    'graphemer': '#ef4444',
    'grapheme-splitter': '#f97316',
    '@formatjs/intl-segmenter': '#eab308',
    'unicode-rs/unicode-segmentation (wasm)': '#3b82f6',
    'Intl.Segmenter': '#8b5cf6',
  };

  const scenarioColors = {
    'Lorem ipsum (ascii)': '#22c55e',
    'Emojis': '#f97316',
    'Hindi': '#eab308',
    'Demonic characters': '#ef4444',
    'Tweet text (combined)': '#3b82f6',
    'Code snippet (combined)': '#8b5cf6',
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>unicode-segmenter Benchmark Results</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #0d1117;
      color: #c9d1d9;
    }
    h1, h2, h3 { color: #58a6ff; }
    h1 { text-align: center; margin-bottom: 10px; }
    .subtitle { text-align: center; color: #8b949e; margin-bottom: 30px; }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
      gap: 30px;
    }
    .chart-container {
      background: #161b22;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #30363d;
    }
    .chart-container.full-width {
      grid-column: 1 / -1;
    }
    .chart-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #c9d1d9;
    }
    .chart-subtitle {
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 10px;
    }
    canvas { max-height: 400px; }
    .trend-canvas { max-height: 350px; }
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
      font-size: 14px;
    }
    .summary-table th, .summary-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #30363d;
    }
    .summary-table th {
      background: #21262d;
      color: #58a6ff;
    }
    .summary-table tr:hover {
      background: #21262d;
    }
    .speedup {
      color: #22c55e;
      font-weight: bold;
    }
    .speedup-faster {
      color: #ef4444;
      font-weight: bold;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin: 20px 0;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      padding: 6px 12px;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }
    .legend-item:hover {
      border-color: #58a6ff;
    }
    .legend-item.disabled {
      opacity: 0.4;
    }
    .legend-item.disabled .legend-color {
      background: #484f58 !important;
    }
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .main-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
      justify-content: center;
    }
    .main-tab {
      padding: 12px 24px;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      cursor: pointer;
      color: #c9d1d9;
      transition: all 0.2s;
      font-size: 16px;
      font-weight: 500;
    }
    .main-tab:hover { background: #30363d; }
    .main-tab.active {
      background: #238636;
      border-color: #238636;
    }
    .platform-selector {
      margin-bottom: 20px;
    }
    .platform-selector label {
      font-size: 14px;
      color: #8b949e;
      margin-right: 10px;
    }
    .platform-select {
      padding: 10px 16px;
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      color: #c9d1d9;
      font-size: 14px;
      cursor: pointer;
      min-width: 280px;
    }
    .platform-select:hover {
      border-color: #58a6ff;
    }
    .platform-select:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
    }
    .platform-select option {
      background: #21262d;
      color: #c9d1d9;
      padding: 10px;
    }
    .main-content { display: none; }
    .main-content.active { display: block; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .trend-section {
      margin-top: 40px;
    }
    .trend-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .stat-card {
      background: #21262d;
      border-radius: 6px;
      padding: 15px;
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #22c55e;
    }
    .stat-value.negative {
      color: #ef4444;
    }
    .stat-label {
      font-size: 12px;
      color: #8b949e;
      margin-top: 5px;
    }
    .improvement-positive { color: #22c55e; }
    .improvement-negative { color: #ef4444; }
  </style>
</head>
<body>
  <h1>unicode-segmenter Benchmark Results</h1>
  <p class="subtitle">Grapheme segmentation performance comparison across different runtimes and platforms</p>

  <div class="main-tabs">
    <button class="main-tab active" onclick="showMainTab('comparison')">Library Comparison</button>
    <button class="main-tab" onclick="showMainTab('trends')">Performance Trends</button>
  </div>

  <div class="main-content active" id="main-comparison">

  <div class="legend" id="comparison-legend">
    ${Object.entries(colors).map(([name, color], idx) => `
      <div class="legend-item" data-library="${name}" data-index="${idx}" onclick="toggleLibrary('${name}', ${idx})">
        <div class="legend-color" style="background: ${color}"></div>
        <span>${SHORT_NAMES[name] || name}</span>
      </div>
    `).join('')}
  </div>

  <div class="platform-selector">
    <label for="comparison-platform">Platform:</label>
    <select id="comparison-platform" class="platform-select" onchange="showTab(this.value)">
      ${latestResults.map((r, i) => `
        <option value="${i}">${formatCpu(r.cpu)} / ${formatRuntime(r.runtime)}</option>
      `).join('')}
    </select>
  </div>

  ${latestResults.map((result, i) => `
    <div class="tab-content ${i === 0 ? 'active' : ''}" id="tab-${i}">
      <h2>${formatCpu(result.cpu)} - ${formatRuntime(result.runtime)}</h2>
      <p class="chart-subtitle">Recorded: ${result.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}</p>

      <div class="charts-grid">
        ${SCENARIOS.map(scenario => {
          const data = result.scenarios[scenario];
          if (!data || Object.keys(data).length === 0) return '';
          return `
            <div class="chart-container">
              <div class="chart-title">${scenario}</div>
              <canvas id="chart-${i}-${scenario.replace(/[^a-z0-9]/gi, '')}"></canvas>
            </div>
          `;
        }).join('')}
      </div>

      <h3>Speedup vs unicode-segmenter</h3>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Scenario</th>
            ${LIBRARIES.filter(l => l !== 'unicode-segmenter/grapheme').map(l => `<th>${SHORT_NAMES[l]}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${SCENARIOS.map(scenario => {
            const data = result.scenarios[scenario];
            if (!data) return '';
            const baseTime = data['unicode-segmenter/grapheme'];
            if (!baseTime) return '';
            return `
              <tr>
                <td>${scenario}</td>
                ${LIBRARIES.filter(l => l !== 'unicode-segmenter/grapheme').map(l => {
                  const time = data[l];
                  if (!time) return '<td>-</td>';
                  const ratio = time / baseTime;
                  if (ratio >= 1) {
                    return `<td class="speedup">${ratio.toFixed(2)}x slower</td>`;
                  } else {
                    return `<td class="speedup-faster">${(1 / ratio).toFixed(2)}x faster</td>`;
                  }
                }).join('')}
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `).join('')}

  </div>

  <div class="main-content" id="main-trends">
    <h2>unicode-segmenter Performance Over Time</h2>
    <p class="chart-subtitle">Track throughput changes across different benchmark scenarios and platforms (higher is better)</p>

    <div class="legend" id="trend-legend">
      ${Object.entries(scenarioColors).map(([name, color], idx) => `
        <div class="legend-item" data-scenario="${name}" data-index="${idx}" onclick="toggleScenario('${name}', ${idx})">
          <div class="legend-color" style="background: ${color}"></div>
          <span>${name}</span>
        </div>
      `).join('')}
    </div>

    <div class="platform-selector">
      <label for="trend-platform">Platform:</label>
      <select id="trend-platform" class="platform-select" onchange="showTrendTab(this.value)">
        ${trendData.map((platform, i) => `
          <option value="${i}">${platform.label}</option>
        `).join('')}
      </select>
    </div>

    ${trendData.map((platform, i) => `
      <div class="tab-content trend-content ${i === 0 ? 'active' : ''}" id="trend-tab-${i}">
        <div class="chart-container full-width">
          <div class="chart-title">${platform.label} - Performance History</div>
          <div class="chart-subtitle">${platform.dataPoints.length} data points from ${platform.dataPoints[0]?.dateFormatted || 'N/A'} to ${platform.dataPoints[platform.dataPoints.length - 1]?.dateFormatted || 'N/A'}</div>
          <canvas id="trend-chart-${i}" class="trend-canvas" height="300"></canvas>
        </div>

        ${platform.dataPoints.length >= 2 ? generateTrendTable(platform) : '<p class="chart-subtitle">Need at least 2 data points to show trends.</p>'}
      </div>
    `).join('')}
  </div>

  <script>
    const colors = ${JSON.stringify(colors)};
    const scenarioColors = ${JSON.stringify(scenarioColors)};
    const shortNames = ${JSON.stringify(SHORT_NAMES)};
    const libraries = ${JSON.stringify(LIBRARIES)};
    const trendData = ${JSON.stringify(trendData)};

    function formatTimeJS(us) {
      if (us < 1) return (us * 1000).toFixed(2) + ' ns';
      if (us < 1000) return us.toFixed(2) + ' µs';
      return (us / 1000).toFixed(2) + ' ms';
    }

    function showMainTab(tabName) {
      document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.main-content').forEach(c => c.classList.remove('active'));

      document.querySelector(\`.main-tab[onclick*="\${tabName}"]\`).classList.add('active');
      document.getElementById('main-' + tabName).classList.add('active');

      // Initialize trend charts when switching to trends tab
      if (tabName === 'trends' && !window.trendChartsInitialized) {
        initTrendCharts();
        window.trendChartsInitialized = true;
      }
    }

    function showTab(index) {
      index = parseInt(index);
      document.querySelectorAll('.tab-content:not(.trend-content)').forEach((c, i) => c.classList.toggle('active', i === index));
    }

    function showTrendTab(index) {
      index = parseInt(index);
      document.querySelectorAll('.trend-content').forEach((c, i) => c.classList.toggle('active', i === index));
    }

    const results = ${JSON.stringify(latestResults)};
    const scenarios = ${JSON.stringify(SCENARIOS)};

    // Track hidden libraries and scenarios
    const hiddenLibraries = new Set();
    const hiddenScenarios = new Set();

    // Store all charts for updating
    const comparisonCharts = [];
    const trendCharts = [];

    // Convert time (µs) to throughput (ops/sec)
    function timeToThroughput(us) {
      return 1_000_000 / us; // ops per second
    }

    // Format throughput for display
    function formatThroughput(opsPerSec) {
      if (opsPerSec >= 1_000_000) return (opsPerSec / 1_000_000).toFixed(2) + 'M ops/s';
      if (opsPerSec >= 1_000) return (opsPerSec / 1_000).toFixed(2) + 'K ops/s';
      return opsPerSec.toFixed(0) + ' ops/s';
    }

    // Toggle library visibility
    function toggleLibrary(libName, idx) {
      const legendItem = document.querySelector(\`.legend-item[data-library="\${libName}"]\`);

      if (hiddenLibraries.has(libName)) {
        hiddenLibraries.delete(libName);
        legendItem.classList.remove('disabled');
      } else {
        hiddenLibraries.add(libName);
        legendItem.classList.add('disabled');
      }

      // Update all comparison charts
      updateComparisonCharts();
    }

    // Toggle scenario visibility in trend charts
    function toggleScenario(scenarioName, idx) {
      const legendItem = document.querySelector(\`.legend-item[data-scenario="\${scenarioName}"]\`);

      if (hiddenScenarios.has(scenarioName)) {
        hiddenScenarios.delete(scenarioName);
        legendItem.classList.remove('disabled');
      } else {
        hiddenScenarios.add(scenarioName);
        legendItem.classList.add('disabled');
      }

      // Update all trend charts
      updateTrendCharts();
    }

    // Update trend charts based on hidden scenarios
    function updateTrendCharts() {
      trendCharts.forEach(chartInfo => {
        const { chart } = chartInfo;

        chart.data.datasets.forEach((dataset, idx) => {
          const scenarioName = dataset.label;
          dataset.hidden = hiddenScenarios.has(scenarioName);
        });

        chart.update();
      });
    }

    // Update comparison charts based on hidden libraries
    function updateComparisonCharts() {
      comparisonCharts.forEach(chartInfo => {
        const { chart, result, scenario } = chartInfo;
        const data = result.scenarios[scenario];
        if (!data) return;

        const labels = [];
        const values = [];
        const originalTimes = [];
        const bgColors = [];

        libraries.forEach(lib => {
          if (data[lib] != null && !hiddenLibraries.has(lib)) {
            labels.push(shortNames[lib] || lib);
            values.push(timeToThroughput(data[lib]));
            originalTimes.push(data[lib]);
            bgColors.push(colors[lib]);
          }
        });

        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.data.datasets[0].backgroundColor = bgColors;
        chart.data.datasets[0].originalTimes = originalTimes;
        chart.update();
      });
    }

    // Initialize comparison charts
    results.forEach((result, i) => {
      scenarios.forEach(scenario => {
        const canvasId = 'chart-' + i + '-' + scenario.replace(/[^a-z0-9]/gi, '');
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const data = result.scenarios[scenario];
        if (!data) return;

        const labels = [];
        const values = [];
        const originalTimes = [];
        const bgColors = [];

        libraries.forEach(lib => {
          if (data[lib] != null) {
            labels.push(shortNames[lib] || lib);
            values.push(timeToThroughput(data[lib]));
            originalTimes.push(data[lib]);
            bgColors.push(colors[lib]);
          }
        });

        const chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              data: values,
              backgroundColor: bgColors,
              borderWidth: 0,
              originalTimes: originalTimes
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    const throughput = ctx.raw;
                    const time = ctx.dataset.originalTimes[ctx.dataIndex];
                    return formatThroughput(throughput) + ' (' + formatTimeJS(time) + ')';
                  }
                }
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { color: '#30363d' },
                title: {
                  display: true,
                  text: 'Throughput (ops/sec) - Higher is Better',
                  color: '#8b949e'
                },
                ticks: {
                  color: '#8b949e',
                  callback: function(val) {
                    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
                    if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K';
                    return val.toFixed(0);
                  }
                }
              },
              y: {
                grid: { display: false },
                ticks: { color: '#c9d1d9' }
              }
            }
          }
        });

        // Store chart reference for later updates
        comparisonCharts.push({ chart, result, scenario });
      });
    });

    // Initialize trend charts
    function initTrendCharts() {
      trendData.forEach((platform, i) => {
        const canvas = document.getElementById('trend-chart-' + i);
        if (!canvas) return;

        const datasets = scenarios.map(scenario => {
          const data = platform.dataPoints
            .filter(dp => dp.scenarios[scenario] != null)
            .map(dp => ({
              x: dp.dateFormatted,
              y: timeToThroughput(dp.scenarios[scenario]),
              originalTime: dp.scenarios[scenario]
            }));

          return {
            label: scenario,
            data: data,
            borderColor: scenarioColors[scenario],
            backgroundColor: scenarioColors[scenario] + '20',
            fill: false,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 8,
          };
        }).filter(ds => ds.data.length > 0);

        const chart = new Chart(canvas, {
          type: 'line',
          data: { datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(ctx) {
                    const throughput = ctx.raw.y;
                    const time = ctx.raw.originalTime;
                    return ctx.dataset.label + ': ' + formatThroughput(throughput) + ' (' + formatTimeJS(time) + ')';
                  }
                }
              }
            },
            scales: {
              x: {
                type: 'category',
                grid: { color: '#30363d' },
                ticks: { color: '#8b949e' }
              },
              y: {
                beginAtZero: true,
                grid: { color: '#30363d' },
                title: {
                  display: true,
                  text: 'Throughput (ops/sec) - Higher is Better',
                  color: '#8b949e'
                },
                ticks: {
                  color: '#8b949e',
                  callback: function(val) {
                    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
                    if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K';
                    return val.toFixed(0);
                  }
                }
              }
            }
          }
        });

        // Store chart reference for later updates
        trendCharts.push({ chart, platform });
      });
    }
  </script>
</body>
</html>`;

  return html;
}

// Main
async function main() {
  const files = await readdir(__dirname);
  const txtFiles = files.filter(f => f.endsWith('.txt')).sort();

  console.log(`Found ${txtFiles.length} benchmark records\n`);

  const allResults = [];

  for (const file of txtFiles) {
    const filePath = join(__dirname, file);
    const result = await parseBenchmarkFile(filePath);
    allResults.push(result);
  }

  // Sort by date
  allResults.sort((a, b) => a.date.localeCompare(b.date));

  // Print summary for latest results per platform
  console.log('='.repeat(80));
  console.log('LATEST BENCHMARK RESULTS');
  console.log('='.repeat(80));

  const latestByPlatform = new Map();
  for (const result of [...allResults].reverse()) {
    const key = `${result.cpu}-${result.runtime.split('_')[0]}`;
    if (!latestByPlatform.has(key)) {
      latestByPlatform.set(key, result);
    }
  }

  for (const [platform, result] of latestByPlatform) {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Platform: ${formatCpu(result.cpu)} | Runtime: ${formatRuntime(result.runtime)}`);
    console.log(`Date: ${result.date}`);
    console.log('-'.repeat(80));

    for (const scenario of SCENARIOS) {
      const data = result.scenarios[scenario];
      if (!data || Object.keys(data).length === 0) continue;

      console.log(`\n### ${scenario}\n`);
      console.log(generateBarChart(data));

      const baseTime = data['unicode-segmenter/grapheme'];
      if (baseTime) {
        console.log('\nSpeedup:');
        for (const [lib, time] of Object.entries(data)) {
          if (lib !== 'unicode-segmenter/grapheme' && time != null) {
            const speedup = (time / baseTime).toFixed(2);
            console.log(`  ${SHORT_NAMES[lib]}: ${speedup}x slower`);
          }
        }
      }
    }
  }

  // Generate HTML report
  const html = generateHTML(allResults);
  const htmlPath = join(__dirname, 'report.generated.html');
  await import('node:fs/promises').then(fs => fs.writeFile(htmlPath, html));
  console.log(`\n${'='.repeat(80)}`);
  console.log(`HTML report generated: ${htmlPath}`);

  // Print trends over time
  console.log(`\n${'='.repeat(80)}`);
  console.log('PERFORMANCE TRENDS OVER TIME');
  console.log('='.repeat(80));

  // Group by cpu+runtime for trend analysis
  const trends = {};
  for (const result of allResults) {
    const key = `${result.cpu}-${result.runtime.split('_')[0]}`;
    if (!trends[key]) trends[key] = [];
    trends[key].push(result);
  }

  for (const [platform, results] of Object.entries(trends)) {
    if (results.length < 2) continue;

    console.log(`\n${platform}:`);
    const first = results[0];
    const last = results[results.length - 1];

    for (const scenario of SCENARIOS) {
      const firstData = first.scenarios[scenario];
      const lastData = last.scenarios[scenario];
      if (!firstData || !lastData) continue;

      const firstTime = firstData['unicode-segmenter/grapheme'];
      const lastTime = lastData['unicode-segmenter/grapheme'];
      if (!firstTime || !lastTime) continue;

      const improvement = ((firstTime - lastTime) / firstTime * 100).toFixed(1);
      const direction = improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→';
      console.log(`  ${scenario}: ${formatTime(firstTime)} → ${formatTime(lastTime)} (${direction} ${Math.abs(improvement)}%)`);
    }
  }
}

main().catch(console.error);
