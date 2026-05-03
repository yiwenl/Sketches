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
});
