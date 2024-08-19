// find-folder-promise.js

const fs = require('fs');
const path = require('path');
const isDir = require('./isDirectory');

const contains = (mDir, mTarget) => new Promise((resolve, reject) => {
	if (mDir.indexOf(mTarget) > -1) {
		resolve(mDir);	
	} else {
		if (!isDir(mDir)) {
			reject();
			return;
		}

		const paths = fs.readdirSync(mDir);
		paths.forEach((subPath)=> {
			const _subPath = path.resolve(mDir, subPath);
			if(isDir(_subPath)) {
				return contains(_subPath, mTarget).then(resolve, reject);
			}
		});
	}
	
});


module.exports = contains;