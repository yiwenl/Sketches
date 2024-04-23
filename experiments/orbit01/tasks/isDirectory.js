// isDirectory.js
const fs = require('fs');

module.exports = function isDirectory(mPath) {
	try {
		return fs.lstatSync(mPath).isDirectory();	
	} catch(e) {
		return false;
	}
}