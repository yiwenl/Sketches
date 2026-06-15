import { defineConfig } from "vite";
import { resolve, basename, dirname } from "path";
import { fileURLToPath } from "url";
import string from "vite-plugin-string";

// Derive the app folder name so the production `base` works on GitHub Pages
// (https://yiwenl.github.io/Sketches/experiments2/apps/<name>/dist/) without
// per-app edits. Local dev still serves from `/`.
const __dirname = dirname(fileURLToPath(import.meta.url));
const appName = basename(__dirname);

export default defineConfig(({ command }) => ({
  root: ".",
  base:
    command === "build"
      ? `/Sketches/experiments2/apps/${appName}/dist/`
      : "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    string({
      include: ["**/*.vert", "**/*.frag"],
    }),
  ],
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "@utils": resolve(__dirname, "../../libs/utils/index.ts"),
      "@alfrid": resolve(__dirname, "../../libs/alfrid/index.js"),
      "@asset-loader": resolve(__dirname, "../../libs/asset-loader/index.ts"),
      "gl-matrix": resolve(__dirname, "../../node_modules/gl-matrix"),
      scheduling: resolve(__dirname, "../../node_modules/scheduling"),
      "object-assign": resolve(__dirname, "../../node_modules/object-assign"),
    },
  },
  server: {
    port: 3000,
    strictPort: false, // Automatically try next available port if 3000 is in use
    host: true, // Allow access from network (0.0.0.0)
    open: true,
  },
}));
