// BinaryLoader.js

class BinaryLoader {

	constructor(isArrayBuffer = false) {
		this._req = new XMLHttpRequest();
		this._req.addEventListener('load', (e)=>this._onLoaded(e));
		this._req.addEventListener('progress', (e)=>this._onProgress(e));
		if(isArrayBuffer) {
			this._req.responseType = 'arraybuffer';
		}
	}	


	load(url, callback) {
		console.log('Loading : ', url);
		this._callback = callback;

		this._req.open('GET', url);
		this._req.send();
	}


	_onLoaded() {
		this._callback(this._req.response);
	}

	_onProgress(/* e*/) {
		// console.log('on Progress:', (e.loaded/e.total*100).toFixed(2));
	}
}

export default BinaryLoader;