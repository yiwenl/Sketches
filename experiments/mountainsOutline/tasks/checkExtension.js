// checkExtension.js

'use strict';

const getExtension = require('./getExtension');

module.exports = function checkExtension(mFile, mExtensions) {
	if(mExtensions.length == 0) {
		return true;
	}

	
	let extensions;

	if(!mExtensions.concat) 
	{
		extensions = [mExtensions];
	} 
	else 
	{
		extensions = mExtensions.concat();
	}

	const ext = getExtension(mFile);
	return mExtensions.indexOf(ext) > -1;
}