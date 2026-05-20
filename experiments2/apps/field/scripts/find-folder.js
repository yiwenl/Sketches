// find-folder.js

'use strict';

import fs from 'fs';
import path from 'path';
import isDir from './isDirectory.js';

function contains(mDir, mTarget, mCallback) {
	fs.readdir(mDir, (err, files) => {
		if(err) {
			console.error(err);
			throw err;
		}
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

export default contains;