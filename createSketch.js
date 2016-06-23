// test.js
"use strict"

const copyDir = require('copy-dir');
const sketches = require('./src/js/ExpModel.js');
console.log('Number of Sketches : ', sketches.length);

sketches.map( (sketch, i) => {
	copyDir('./exps/_template', `./exps/${i}`, function(err) {
		if(err) {
			console.log(err);		
		} else {
			console.log(`Created : ./exps/${i}`);
		}
	});	
});
