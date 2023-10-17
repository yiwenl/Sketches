// test.js
"use strict"

const mkdirp = require('mkdirp');
const fs = require('fs');
const sketches = require('./src/js/ExpModel.js');

const PATH_TEMPLATE = './exps/_template/index.html';
console.log('Number of Sketches : ', sketches.length);

sketches.map( (sketch, i) => {
	const folderPath = `./exps/${i}`;

	mkdirp(folderPath, (err) => {
		if(err) console.log(err);
		else {
			readTemplate(sketch, i, folderPath);
		}
	});
});


function replace(str, pattern, strToReplace) {	return str.replace(new RegExp(pattern, 'g'), strToReplace);	}


function readTemplate(sketch, i, folderPath) {
	const url = `http://yiwenl.github.io/Sketches/exps/${i}/`;
	const cover = sketch.cover;
	const title = sketch.title;

	console.log('Create Folder : ', folderPath, url, cover);

	fs.readFile(PATH_TEMPLATE, 'utf8', (err, str) => {
		if(err) {
			console.log('Error Loading file !');
		} else {
			str = replace(str, '{{URL}}', url);
			str = replace(str, '{{COVER}}', cover);
			str = replace(str, '{{TITLE}}', title);
			saveHTML(str, folderPath);
		}
	});
}


function saveHTML(strHTML, folderPath) {

	fs.writeFile(`${folderPath}/index.html`, strHTML, (err, data) => {
		if(err) {
			console.log('Error Writing File');
		} else {
			console.log('Written :', folderPath);	
		}
		
	})
}
