import { defineConfig } from "vite";
import { resolve, basename, dirname } from "path";
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
      scheduling: resolve(__dirname, "../../node_modules/scheduling"),
      "lil-gui": resolve(__dirname, "../../node_modules/lil-gui"),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    open: true,
  },
}));
