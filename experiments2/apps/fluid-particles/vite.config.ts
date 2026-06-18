import { defineConfig } from "vite";
import { basename, dirname, resolve } from "path";
import { fileURLToPath } from "url";

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
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      belfast: resolve(__dirname, "../../libs/belfast/dist/belfast.js"),
      "@fluid-sim-belfast": resolve(
        __dirname,
        "../../libs/fluid-sim-belfast/index.ts",
      ),
      "lil-gui": resolve(__dirname, "../../node_modules/lil-gui"),
      scheduling: resolve(__dirname, "../../node_modules/scheduling"),
      "stats.js": resolve(__dirname, "../../node_modules/stats.js"),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: false,
  },
}));
