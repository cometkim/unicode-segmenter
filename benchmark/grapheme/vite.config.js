import { viteExternalsPlugin } from 'vite-plugin-externals';

export default {
  root: import.meta.dirname,
  optimizeDeps: {
    exclude: [
      'mitata',
      'bun:jsc',
    ],
  },
  plugins: [
    viteExternalsPlugin({
      'bun:jsc': 'void 0',
    }),
  ],
};
