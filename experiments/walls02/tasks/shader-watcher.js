// shader-watcher.js

'use strict';

const fs                = require('fs');
const path              = require('path');
const findFolder        = require('./find-folder');
const watcher           = require('./watch');
const copyFile          = require('./copy-file');
const checkExtension    = require('./checkExtension');

const PATH_SRC          = './src';
const TEMPLATE_VERTEX   = './tasks/basic.vert';
const TEMPLATE_FRAGMENT = './tasks/copy.frag';
const regShader         = /shaders\/.+\.(vert|frag)/g;

let shaderPath;

findFolder(PATH_SRC, 'shaders', (mPath)=> {
	shaderPath = mPath;
	startWatch();
});


let watcherViews = watcher([PATH_SRC]);

function startWatch() {
	watcherViews.on('all',(event, file) => {
		if(file.indexOf('.DS_Store') > -1) return;
		if(!checkExtension(file, ['js'])) return;
		console.log('Event:', event, 'file :' , file);
		if(event !== 'add' && event !== 'change') return;

		getShaderImports(file, (shaderImports) => onFile(shaderImports));
	});
}

function onFile(shaderImports) {
	if(shaderImports.length == 0) { return;	}
	console.log('Shader Imports :', shaderImports);

	shaderImports.forEach((mName)=> {
		isShaderExist(mName, (name)=>generateShader(name));
	});
}


function generateShader(mName) {
	if(isVertexShader(mName)) {
		generateVertexShader(mName);
	} else {
		generateFragmentShader(mName);
	}
}


function getShaderImports(mPath, mCallback) {
	let results = [];

	fs.readFile(mPath, 'utf8', (err, str) => {
		if(err) {
			console.log('Error Loading file !');
		} else {
			let match;
			while( match = regShader.exec(str)) {
				results.push(match[0]);
			}

			results = results.map((path)=> {
				return path.replace('shaders/', '');
			});

			mCallback(results);
		}
	});
}

function hasShaderImport(mPath) {
	return getShaderImports(mPath).length > 0;
}

function isShaderExist(mShaderName, mCallback) {
	fs.readdir(shaderPath, (err, files) => {
		if(files.indexOf(mShaderName) === -1) {
			mCallback(mShaderName);
		}
	});

	return false;
}

function generateVertexShader(mName) {
	console.log('Generate vertex shader :', mName);
	copyFile(TEMPLATE_VERTEX, path.resolve(shaderPath, mName), (err)=> {
		if(err) console.log('Err', err);
	});
}

function generateFragmentShader(mName) {
	console.log('Generate fragment shader : ', mName);
	copyFile(TEMPLATE_FRAGMENT, path.resolve(shaderPath, mName), (err)=> {
		if(err) console.log('Err', err);
	});
}

function isVertexShader(mName) {
	return mName.indexOf('.vert') > -1;
}
