// getFileName.js

'use strict';

module.exports = function getFileName(mPath) {
	const ary       = mPath.split('/');
	let str         = ary[ary.length-1];
	const lastIndex = str.lastIndexOf('.');
	str             = str.substring(0, lastIndex);
	return str;
}