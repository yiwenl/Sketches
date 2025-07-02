const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

console.log("__dirname", __dirname);

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(glsl|vert|frag)$/,
        use: ["raw-loader", "glslify-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: "body",
      publicPath: "./",
    }),
  ],
  resolve: {
    alias: {
      alfrid: path.resolve(__dirname, "../src/alfrid"),
      shaders: path.resolve(__dirname, "../src/shaders"),
    },
  },
};
