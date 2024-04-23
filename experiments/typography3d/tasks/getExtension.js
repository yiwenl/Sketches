// getExtension.js

'use strict';

module.exports = function(mFile) {
	const ary = mFile.split('.');
	return ary[ary.length - 1];
}