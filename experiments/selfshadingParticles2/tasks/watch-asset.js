// watch-asset.js

'use strict';

const fs           = require('fs');
const watcher      = require('./watch');
const getExtension = require('./getExtension');
const getFileName = require('./getFileName');

const ASSETS_PATH   = [
						'./dist/assets/img', 
						'./dist/assets/obj'
						];


const OUTPUT_PATH 	= './src/js/asset-list.js';
const TEMPLATE_PATH = './tasks/asset-template.js';
let assets = [];
let needUpdate = true;


function replace(str, pattern, strToReplace)  {
	return str.replace(new RegExp(pattern, 'g'), strToReplace);	
}

function saveFile(str)  {
	fs.writeFile(OUTPUT_PATH, str, (err, data) => {
		if(err)  {
			console.log('Error Writing File');
		} else {
			console.log('asset-list.js updated');	
		}
	});
}

function getAssetsInDir(mSourceDir, mCallback) {
	fs.readdir(mSourceDir, (err, files) => {

		//	ERROR GETTING FOLDER
		if(err) {
			console.log('Error :', err);
			return;
		}

		const assets = files.filter((f)=> {
			return f.indexOf('DS_Store') === -1;
		});

		const assetPath = mSourceDir.replace('./dist/', '');
		console.log(mSourceDir, assetPath);
		const assetsPaths = assets.map((f) => {
			return `${assetPath}/${f}`;
		});

		//	RETURN ASSETS IN FOLDER
		mCallback(assetsPaths);
	});
}

function getAssets() {
	assets = [];
	let count = 0;

	const onFolder = (files) => {
		assets = assets.concat(files);
		count ++;

		if (count == ASSETS_PATH.length) {
			generateAssetList();
		}
	}

	for(let i=0; i<ASSETS_PATH.length; i++) {
		let dir = ASSETS_PATH[i];
		getAssetsInDir(dir, onFolder);
	}
}

function getAssetType(mExt) {
	switch(mExt) {
		case 'jpg' :
			return 'jpg';
		case 'png' :
			return 'png';
		case 'obj' :
			return 'text';
		case 'dds' :
			return 'binary';
		case 'hdr' :
			return 'binary';
	}
}

function generateAssetList() {
	const list = assets.map( (file) => {
		const id = getFileName(file);
		const url = file;
		const ext = getExtension(file);
		const type = getAssetType(ext);

		return {
			id,
			url,
			type
		}
	});

	let strList = JSON.stringify(list);
	strList = strList.replace('[', '[\n\t');
	strList = strList.replace(']', '\n]');
	strList = strList.split('},{').join('},\n\t{');
	console.log(strList);

	fs.readFile(TEMPLATE_PATH, 'utf8', (err, str) => {
		if(err) {
			console.log('Error Loading file !');
		} else {
			str = replace(str, '{{ASSETS}}', strList);
			saveFile(str);
		}
	});
}

function loop() {
	if(needUpdate) {
		console.log('Update Assets');
		getAssets();
		needUpdate = false;
	}
}

setInterval(loop, 500);
const watcherAssets = watcher([ ASSETS_PATH ]);

watcherAssets.on('all',(event, file) => {
	console.log('Event:',event);
	if(file.indexOf('.DS_Store') > -1) return;
	needUpdate = true;
});
