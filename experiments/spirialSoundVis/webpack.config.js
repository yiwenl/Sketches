/* eslint comma-dangle: 0 */
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const prod = process.env.NODE_ENV === 'production';

function getEntrySources() {
  // if (!prod) {
  //   return ['./test/main.js']
  // }
  return ['./src/index.js'];
}


function getOutput() {
  return path.resolve(__dirname, prod ? "dist" : "dev" )
}

module.exports = {
  entry: {
    app: getEntrySources()
  },
  stats: {
    cached: false,
    cachedAssets: false,
    chunkModules: false,
    chunks: false,
    colors: true,
    errorDetails: true,
    hash: false,
    progress: true,
    reasons: false,
    timings: true,
    version: false
  },
  output: {
    path: getOutput(),
    publicPath: 'http://localhost:8080/',
    filename:'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        plugins: ['transform-runtime', 'add-module-exports'],
        presets: ['es2015', 'stage-1']
      }
    },
    {
      test: /\.css$/,
      loader: 'style!css'
    },
    {
      test: /\.scss$/,
      loader: prod ?
        ExtractTextPlugin.extract("style-loader", `css-loader!autoprefixer-loader?browsers=last 3 version!sass-loader?includePaths[]=dist`) :
        `style!css!autoprefixer?browsers=last 3 version!sass?includePaths[]=dist` 
    },
    { test: /\.(glsl|frag|vert)$/, loader: 'raw', exclude: /node_modules/ },
    { test: /\.(glsl|frag|vert)$/, loader: 'glslify', exclude: /node_modules/ }
    ]
  },
  plugins: prod ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new ExtractTextPlugin('main.css')
  ] : []
};