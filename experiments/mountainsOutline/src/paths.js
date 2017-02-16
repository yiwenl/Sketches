// path.js
'use strict';


const sourcePath = './raw-assets/';
const destPath = './dist/assets/';


module.exports = {
	source: 
	{
		path: sourcePath,
		audio: sourcePath + 'audio/',
		image: sourcePath + 'image/'
	},
	destination: 
	{
		path: destPath,
		audio: destPath + 'audio/',
		image: destPath + 'image/'
	},
	manifest: './output/'
}