import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@state", replacement: path.resolve(__dirname, "src/state") },
    ],
  },
  build: {
    lib: {
      entry: {
        'pudu-graph': 'src/pudu-graph.ts',
        'react/PuduGraphReact': 'src/react/PuduGraphReact.tsx'
      },
      formats: ['es'],
      fileName: (format, entryName) => {
        return `${entryName}.js`;
      },
    },
    outDir: 'dist',
    rollupOptions: {
      external: process.env.BUILD_TARGET === 'standalone' ? [] : ['lit', 'react', 'react-dom', '@lit-labs/react'],
      output: {
        // Optimizaciones para Vercel
        manualChunks: undefined,
        inlineDynamicImports: false,
      },
    },
    // Optimizaciones para producción
    minify: 'terser',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
  // Configuración para Vercel
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
