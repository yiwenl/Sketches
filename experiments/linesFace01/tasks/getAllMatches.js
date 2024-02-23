// getAllMatches.js

'use strict';

module.exports = function getAllMatches(mStr, mRegExp, mWithDetials) {
	mWithDetials = mWithDetials || false;
	let results = [];

	let match;
	while( match = mRegExp.exec(mStr)) {
		if(mWithDetials) {
			results.push(match);
		} else {
			results.push(match[0]);	
		}
		
	}

	return results;
}