// test.js
"use strict"
const copyDir = require('copy-dir');

const sketches = require('./src/js/ExpModel.js');

console.log('Data : ', sketches.length);

for (let i=0; i<sketches.length; i++) {
	copyDir('./exps/_template', `./exps/${i}`, function(err) {
		if(err) {
			console.log(err);		
		} else {
			console.log(`Created : ./exps/${i}`);
		}
	});	
}
