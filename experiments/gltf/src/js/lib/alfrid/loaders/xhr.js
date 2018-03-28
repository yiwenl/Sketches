// xhr.js

const load = (mPath, isArrayBuffer) => new Promise((resolve, reject) => {
	const req = new XMLHttpRequest();
	req.addEventListener('load', (e) => {
		resolve(req.response);
	});

	req.addEventListener('error', (e) => {
		reject(e);
	});

	if(isArrayBuffer) {
		req.responseType = 'arraybuffer';
	}

	req.open('GET', mPath);
	req.send();

});

export default load;