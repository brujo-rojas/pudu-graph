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
      external: ['lit', 'react', 'react-dom', '@lit-labs/react'],
    },
  },
});
