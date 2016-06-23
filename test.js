// test.js

"use strict"

const fs = require('fs');

// fs.readFile('./exps/_template/index.html', 'utf8', function (err,data) {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(data);
// });


fs.readFile('./exps/_template/index.html', 'utf8', (err, str) => {
	if(err) {
		console.log('Error Loading file !');
	} else {
		console.log(str);

		updateHTML(str);
	}
});

// fs.writeFile('/etc/doesntexist', 'abc', function (err,data) {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(data);
// });

function updateHTML(strTemplate) {
	const urlString = 'http://yiwenl.github.io/Sketches/';
	strTemplate = strTemplate.replace('{{URL}}', urlString);
	console.log(strTemplate);

	fs.writeFile('./exps/_template/indexTest.html', strTemplate, (err, data) => {
		if(err) {
			console.log('Error Writing File');
		}
		console.log('Writing :', data);
	})
}
