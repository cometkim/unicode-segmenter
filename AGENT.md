# unicode-segmenter

A TypeScript/JavaScript library for Unicode text segmentation (UAX #29).

## Commands

- Build: `yarn build` (also runs `yarn clean && tsc -p tsconfig.build.json`)
- Test: `yarn test` (Node.js test runner with `node --test`)
- Test with coverage: `yarn test:coverage`
- Run single test file: `node --test test/{filename}.js`
- Clean: `yarn clean` (removes built artifacts)
- Performance benchmarks: `yarn perf:grapheme`, `yarn perf:emoji`, `yarn perf:general`

## Architecture

Unicode text segmentation library with multiple entry points:
- `src/index.js`: Main export aggregating all functionality
- `src/grapheme.js`: Extended grapheme cluster segmentation (primary feature)
- `src/emoji.js`: Single codepoint emoji matching
- `src/general.js`: Alphanumeric character matching
- `src/intl-adapter.js`: Intl.Segmenter compatibility adapter
- `src/utils.js`: Shared utilities
- `src/_*_data.js`: Unicode data tables (generated from Unicode specs)
- `test/`: Node.js test files with comprehensive Unicode test cases

## Code Style

- ES modules with `.js` extensions (`type: "module"` in package.json)
- TypeScript via JSDoc with `// @ts-check` headers
- Semicolons required, single quotes preferred
- Node.js built-in test runner for testing (`import { test } from 'node:test'`)
- Property testing with fast-check for Unicode compliance
- No external dependencies in runtime code
