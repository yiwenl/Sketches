/* eslint comma-dangle: 0 */
const webpack           = require('webpack');
const path              = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const prod              = process.env.NODE_ENV === 'production';
const isDevelopment     = process.env.NODE_ENV === 'development';
const ip                = require('ip');
const serverIp          = ip.address();

function getOutput() {

  if(prod) {
    return path.resolve(__dirname, "assets/" )  
  } else {
    return path.resolve(__dirname, "assets/" )  
  }
  
}

module.exports = {
  hotPort: 8080,
  cache: isDevelopment,
  debug: isDevelopment,
  entry: {
    app: ['./src/js/app.js']
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
    filename:'js/bundle.js',
    publicPath: isDevelopment ? `http://${serverIp}:8080/assets/` : ''
  },
  module: {
    loaders: [
      {
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
          ExtractTextPlugin.extract("style-loader", `css-loader!autoprefixer-loader?browsers=last 3 version!sass-loader?includePaths[]=""`) :
          `style!css!autoprefixer?browsers=last 3 version!sass?includePaths[]=""` 
      },
      { test: /\.(glsl|frag|vert)$/, loader: 'raw', exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, loader: 'glslify', exclude: /node_modules/ }
    ]
  },
  plugins: prod ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new ExtractTextPlugin('css/main.css')
  ] : [
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"development"'}),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};