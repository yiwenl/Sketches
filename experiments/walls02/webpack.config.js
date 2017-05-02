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
		return path.resolve(__dirname, "dist/assets/" )  
	} else {
		return path.resolve(__dirname, "dist/assets/" )  
	}
	
}

module.exports = {
	hotPort: 8081,
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
		publicPath: isDevelopment ? `http://${serverIp}:8081/assets/` : ''
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
					ExtractTextPlugin.extract("style-loader", `css-loader!autoprefixer-loader?browsers=last 3 version!sass-loader?includePaths[]=dist`) :
					`style!css!autoprefixer?browsers=last 3 version!sass?includePaths[]=dist` 
			},
			{ test: /\.(glsl|frag|vert)$/, loader: 'raw', exclude: /node_modules/ },
			{ test: /\.(glsl|frag|vert)$/, loader: 'glslify', exclude: /node_modules/ }
		]
	},
	resolve: {
		root:__dirname + "/js",
		fallback: path.join(__dirname, "node_modules"),
		alias: {
			'shaders' : __dirname + "/src/shaders",
			'PIXI'  : __dirname + "/src/js/lib/pixi"
		}
	},
	plugins: prod ? [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				drop_console: true,
				screw_ie8: true,
				warnings: false
			}
		}),
		new ExtractTextPlugin('css/main.css')
	] : [new webpack.optimize.OccurenceOrderPlugin()]
};