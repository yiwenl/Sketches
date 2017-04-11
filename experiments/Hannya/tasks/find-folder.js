// find-folder.js

'use strict';

const fs = require('fs');
const path = require('path');
const isDir = require('./isDirectory');

function contains(mDir, mTarget, mCallback) {
	fs.readdir(mDir, (err, files) => {
		if(files.indexOf(mTarget) > -1) {
			// mCallback(`${mDir}/${mTarget}`);
			mCallback(path.resolve(mDir, mTarget));
		} else {

			const onDir = (mSubDir) => {
				if(mSubDir !== null) {
					mCallback(mSubDir);
				}
			}

			const folders = files.filter((a)=> {
				const subPath = path.resolve(mDir, a);
				return isDir(subPath);
			});

			if(folders.length == 0) {
				mCallback(null, mTarget);
			} else {
				folders.forEach((f)=> {
					const subPath = path.resolve(mDir, f);
					if(isDir(subPath)) {
						contains(subPath, mTarget, onDir);
					}	
				});
			}
		}
	});
}

module.exports = contains;