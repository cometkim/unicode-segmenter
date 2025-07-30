# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

unicode-segmenter is a lightweight, spec-compliant implementation of Unicode Text Segmentation (UAX #29) for JavaScript. It provides text segmentation by grapheme clusters, emoji matching, and general alphanumeric character matching with excellent performance and small bundle size.

## Development Commands

### Build & Development
- `yarn build` - Build the project (runs build-exports.js + TypeScript compilation)
- `yarn clean` - Remove all generated files (*.js, *.cjs, *.map, *.d.ts, bundle/)
- `yarn prepack` - Full build pipeline (clean + build)

### Testing
- `yarn test` - Run tests using Node.js built-in test runner
- `yarn test:coverage` - Run tests with coverage reporting (generates lcov.info)

### Performance & Benchmarking
- `yarn perf:grapheme` - Run grapheme segmentation performance benchmarks
- `yarn perf:emoji` - Run emoji matching performance benchmarks
- `yarn perf:general` - Run general character matching performance benchmarks
- `yarn perf:grapheme:browser` - Run browser-based grapheme benchmarks using Vite
- `yarn perf:grapheme:hermes` - Run Hermes (React Native) specific benchmarks
- `yarn perf:grapheme:quickjs` - Run QuickJS specific benchmarks

### Bundle Analysis
- `yarn bundle-stats:grapheme` - Analyze grapheme module bundle size
- `yarn bundle-stats:emoji` - Analyze emoji module bundle size
- `yarn bundle-stats:general` - Analyze general module bundle size
- `yarn bundle-stats:grapheme:hermes` - Analyze Hermes bytecode size

## Architecture

### Module Structure
The project uses a modular architecture with separate entry points:

- **src/index.js** - Main entry point, re-exports all modules
- **src/grapheme.js** - Extended grapheme cluster segmentation (core functionality)
- **src/emoji.js** - Emoji character property matching
- **src/general.js** - General/alphanumeric character property matching
- **src/utils.js** - UTF-16 surrogate pair handling utilities
- **src/intl-adapter.js** - Intl.Segmenter API-compatible adapter
- **src/intl-polyfill.js** - Intl.Segmenter polyfill
- **src/core.js** - Shared segmentation utilities

### Data Files
Unicode data is pre-processed and stored in compact binary format:
- **src/_grapheme_data.js** - Grapheme cluster break categories and ranges
- **src/_emoji_data.js** - Emoji property data
- **src/_general_data.js** - General category property data
- **src/_incb_data.js** - Indic Conjunct Break data

### Build System
- **scripts/build-exports.js** - Main build script that handles ESM/CJS dual exports
- Custom build process creates both .js (ESM) and .cjs (CommonJS) versions
- Bundle generation using esbuild for optimized standalone builds
- TypeScript compilation for .d.ts generation using tsconfig.build.json

### Testing Architecture
- Uses Node.js built-in test runner (not Jest/Mocha)
- **test/_helper.js** - Shared test utilities
- **test/_unicode_testdata.js** - Unicode test suite data
- Tests verify compliance with official Unicode test suites
- Comprehensive coverage including fuzzing against native Intl.Segmenter

### Performance Focus
The library prioritizes runtime performance:
- Optimized Unicode data compression and lookup algorithms
- Careful memory management and minimal object allocation
- Benchmarking against multiple runtimes (Node.js, Browser, Hermes, QuickJS)
- Performance tracking across different Unicode text types

## Key Implementation Details

- **Unicode Version**: Currently implements Unicode 16.0.0 (UAX #29 Revision 45)
- **ES2015+ Target**: Uses modern JavaScript features (generators, String.codePointAt)
- **Zero Dependencies**: Self-contained implementation with no external dependencies
- **Multi-Runtime Support**: Optimized for Node.js, browsers, React Native (Hermes), and QuickJS
- **Spec Compliance**: Maintains 100% compliance with Unicode segmentation rules