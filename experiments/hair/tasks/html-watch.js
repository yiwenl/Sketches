// html-watch.js
const watcher  = require('./watch');
const path     = require('path');
const fs       = require('fs-extra');

const env      = process.env.NODE_ENV;
const isProd   = env === 'production';
const PATH_SRC = path.resolve('./src/html');

const watcherViews = watcher([PATH_SRC]);


const processTemplate = (str) => new Promise((resolve, reject) => {
	if(isProd) {
		str = str.replace(/{{dev.*}}/g, '');	
	} else {
		str = str.replace(/{{dev/g, '');
		str = str.replace(/}}/g, '');
	}
	
	resolve(str);
});

const writeTemplate = (str) => new Promise((resolve, reject) => {
	fs.writeFile('./dist/index.html', str, 'utf8');
});

watcherViews.on('all', (event, file) => {
	if(file.indexOf('.html') === -1) return;

	fs.readFile(file, 'utf8')
	.then( processTemplate )
	.then( writeTemplate )
	.catch(err=> {
		console.log('Error :', err);
	});
});