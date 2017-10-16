// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const pathOutput = path.resolve(__dirname, 'dist');
const pathNodeModules = path.resolve(__dirname, 'node_modules');
const env = process.env.NODE_ENV;
const isProd = env === 'production';

console.log('Environment isProd :', isProd);

const plugins = [
	new webpack.HotModuleReplacementPlugin()
];

if(isProd) {
	plugins.push(new webpack.optimize.UglifyJsPlugin({
		sourceMap:false,
		compress: {
			drop_debugger: true,
			drop_console: true,
			screw_ie8: true
		},
		comments:false,
		mangle:false
	}));
	plugins.push(new ExtractTextPlugin('assets/css/main.css'));
}

const entry = isProd ? {app:'./src/js/app.js'}
				: {app:'./src/js/app.js', debug:'./src/js/debug.js'};
const output = isProd ? {
		filename:'assets/js/app.js',
		path: pathOutput
	} : {
		filename:'assets/js/[name].js',
		path: pathOutput
	};

const devtool = isProd ? 'source-map' : 'inline-source-map';



const config = {
	entry,
	devtool,
	devServer: {
		host:'0.0.0.0',
		contentBase: './dist',
		hot:true,
		disableHostCheck:true
	},
	plugins,
	output,
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['env']
				},
				exclude: pathNodeModules
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
				exclude: pathNodeModules
			},
			{
				test: /\.scss$/,
				use: isProd ?
				ExtractTextPlugin.extract({
					fallback:"style-loader",
					use: ["css-loader", "sass-loader"]
				}) : 
				["style-loader", "css-loader", "sass-loader"]
				,
				exclude: pathNodeModules
			},
			{
				test: /\.(glsl|vert|frag)$/,
				use: ["raw-loader", "glslify-loader"],
				exclude: pathNodeModules
			}
		]
	},
	resolve: {
		alias: {
			'libs':path.resolve(__dirname, 'src/js/libs'),
			'shaders':path.resolve(__dirname, 'src/shaders')
		}
	}
}

module.exports = config;