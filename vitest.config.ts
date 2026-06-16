/// <reference types="vitest/config" />

import path from 'path';
import { defineConfig, transformWithEsbuild } from 'vite';
import svgr from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

import react from '@vitejs/plugin-react';

function directoryNamedResolver() {
  return {
    name: 'vite-plugin-directory-named-resolver',
    async resolveId(source, importer) {
      if (importer && (source.startsWith('.') || source.startsWith('/'))) {
        const dirname = path.dirname(importer);
        const basename = path.basename(source);
        const potentialFilePath = path.resolve(
          dirname,
          source,
          `${basename}.js`
        );

        const resolved = await this.resolve(potentialFilePath, importer, {
          skipSelf: true,
        });
        if (resolved) {
          return resolved.id;
        }
      }
      return null;
    },
  };
}

function moduleScssResolver() {
  return {
    name: 'vite-plugin-module-scss-resolver',
    resolveId(source, importer) {
      if (source.endsWith('.module')) {
        const resolvedPath = `${source}.scss`;
        return this.resolve(resolvedPath, importer, { skipSelf: true }).then(
          (resolved) => {
            if (resolved) {
              return resolved.id;
            }
            return null;
          }
        );
      }
      return null;
    },
  };
}

const config: any = {
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.(js|ts)$/)) return null;
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
    svgr(),
    directoryNamedResolver(),
    moduleScssResolver(),
    viteTsconfigPaths(),
  ],
  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    css: false,
    include: ['src/**/*.test.{js,jsx}'],
    maxWorkers: 2,
    minWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov', 'json-summary'],
      clean: true,
      cleanOnRerun: true,
      reportOnFailure: true,
      processingConcurrency: 1,
      include: [
        'src/containers/sidebars/dashboard-sidebar/**/*component.jsx',
        'src/containers/sidebars/dashboard-trends-sidebar/**/*component.jsx',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
      reportsDirectory: './dist/coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      containers: path.resolve(__dirname, 'src/containers'),
      images: path.resolve(__dirname, 'src/assets/images'),
      icons: path.resolve(__dirname, 'src/assets/icons'),
      logos: path.resolve(__dirname, 'src/assets/logos'),
      styles: path.resolve(__dirname, 'src/styles'),
      router: path.resolve(__dirname, 'src/router'),
      selectors: path.resolve(__dirname, 'src/store/selectors'),
      store: path.resolve(__dirname, 'src/store'),
      actions: path.resolve(__dirname, 'src/store/actions'),
      utils: path.resolve(__dirname, 'src/utils'),
      context: path.resolve(__dirname, 'src/context'),
      constants: path.resolve(__dirname, 'src/constants'),
      redux_modules: path.resolve(__dirname, 'src/store/redux-modules'),
      services: path.resolve(__dirname, 'src/services'),
      hooks: path.resolve(__dirname, 'src/hooks'),
    },
  },
};

export default defineConfig(config);
