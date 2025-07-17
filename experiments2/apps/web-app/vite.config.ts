import { defineConfig } from "vite";
import { resolve } from "path";
import string from "vite-plugin-string";

export default defineConfig({
  root: ".",
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
    alias: {
      "@experiments2/utils": resolve(__dirname, "../../libs/utils/index.ts"),
      "@experiments2/alfrid": resolve(__dirname, "../../libs/alfrid/index.js"),
      "gl-matrix": resolve(__dirname, "../../node_modules/gl-matrix"),
      scheduling: resolve(__dirname, "../../node_modules/scheduling"),
      "object-assign": resolve(__dirname, "../../node_modules/object-assign"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
