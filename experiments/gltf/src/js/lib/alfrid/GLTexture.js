// GLTexture.js

import getTextureParameters from './utils/getTextureParameters';
import WebglNumber from './utils/WebglNumber';
import GL from './GLTool';
import Scheduler from 'scheduling';

let gl;

class GLTexture {

	constructor(mSource, mParam = {}, mWidth = 0, mHeight = 0) {
		gl = GL.gl;

		this._source = mSource;
		this._getDimension(mSource, mWidth, mHeight);
		this._sourceType = mParam.type || getSourceType(mSource);
		this._checkSource();
		this._texelType = this._getTexelType();
		this._isTextureReady = true;

		this._params = getTextureParameters(mParam, mSource, this._width, this._height);
		this._checkMipmap();
		this._checkWrapping();

		//	setup texture
		this._texture = gl.createTexture();

		if(this._sourceType === 'video') {
			this._isTextureReady = false;
			Scheduler.addEF(()=>this._loop());
		} else {
			this._uploadTexture();	
		}
		
	}

	_loop() {
		if(this._source.readyState == 4) {
			this._isTextureReady = true;
			this._uploadTexture();
		}
	}


	_uploadTexture() {
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		if(this._isSourceHtmlElement()) {
			gl.texImage2D(gl.TEXTURE_2D, 0, this._params.internalFormat, this._params.format, this._texelType, this._source);
		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, this._params.internalFormat, this._width, this._height, 0, this._params.format, this._texelType, this._source);	
		}
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._params.magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._params.minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._params.wrapS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._params.wrapT);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this._params.premultiplyAlpha);

		if(this._params.anisotropy > 0) {
			const ext = GL.getExtension('EXT_texture_filter_anisotropic');
			if(ext) {
				const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
				const level = Math.min(max, this._params.anisotropy);
				gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, level);
			}	
		}
		

		if(this._generateMipmap) {	gl.generateMipmap(gl.TEXTURE_2D);	}

		//	unbind texture
		gl.bindTexture(gl.TEXTURE_2D, null);
	}


	bind(index) {
		if(index === undefined) { index = 0; }
		if(!GL.shader) { return; }

		gl.activeTexture(gl.TEXTURE0 + index);
		if(this._isTextureReady) {
			gl.bindTexture(gl.TEXTURE_2D, this._texture);	
		} else {
			gl.bindTexture(gl.TEXTURE_2D, GLTexture.blackTexture().texture);
		}
		
		this._bindIndex = index;
	}


	updateTexture(mSource) {
		this._source = mSource;
		this._checkSource();
		this._uploadTexture();
	}


	generateMipmap() {
		if (!this._generateMipmap) { return; }
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	showParameters() {
		console.log('Source type : ', WebglNumber[this._sourceType] || this._sourceType);
		console.log('Texel type:', WebglNumber[this.texelType]);
		console.log('Dimension :', this._width, this._height);
		for(const s in this._params) {
			console.log(s, WebglNumber[this._params[s]] || this._params[s]);
		}

		console.log('Mipmapping :', this._generateMipmap);
	}

	_getDimension(mSource, mWidth, mHeight) {
		if(mSource) {
			//	for html image / video element
			this._width = mSource.width || mSource.videoWidth;
			this._height = mSource.height || mSource.videoWidth;

			//	for manual width / height settings
			this._width = this._width || mWidth;
			this._height = this._height || mHeight;

			//	auto detect ( data array) ? not sure is good idea ? 
			//	todo : check HDR 
			if(!this._width || !this._height) {
				this._width = this._height = Math.sqrt(mSource.length / 4);
				// console.log('Auto detect, data dimension : ', this._width, this._height);	
			}

		} else {
			this._width = mWidth;
			this._height = mHeight;
		}
	}

	_checkSource() {
		if(!this._source) {	return; }

		if(this._sourceType === GL.UNSIGNED_BYTE) {
			if (!(this._source instanceof Uint8Array)) {
				// console.log('Converting to Uint8Array');
				this._source = new Uint8Array(this._source);
			}
		} else if(this._sourceType === GL.FLOAT) {
			if (!(this._source instanceof Float32Array)) {
				// console.log('Converting to Float32Array');
				this._source = new Float32Array(this._source);
			}
		}

	}

	_getTexelType() {
		if(this._isSourceHtmlElement()) {
			return GL.UNSIGNED_BYTE;	
		}

		//	bad code here, if the type is not on the webglNumber list, it doesn't work
		return GL[WebglNumber[this._sourceType]] || this._sourceType;
	}

	_checkMipmap() {
		this._generateMipmap = this._params.mipmap;

		if(!(isPowerOfTwo(this._width) && isPowerOfTwo(this._height))) {
			this._generateMipmap = false;
		}

		const minFilter = WebglNumber[this._params.minFilter];
		if(minFilter.indexOf('MIPMAP') == -1) {
			this._generateMipmap = false;
		}
	}

	_checkWrapping() {
		if(!this._generateMipmap) {
			this._params.wrapS = GL.CLAMP_TO_EDGE;
			this._params.wrapT = GL.CLAMP_TO_EDGE;
		}
	}

	_isSourceHtmlElement() {
		return this._sourceType === 'image' || this._sourceType === 'video' || this._sourceType === 'canvas';
	}


	get minFilter() {	return this._params.minFilter;	}

	set minFilter(mValue) {
		this._params.minFilter = mValue;
		this._checkMipmap();

		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._params.minFilter);
		gl.bindTexture(gl.TEXTURE_2D, null);

		this.generateMipmap();
	}

	get magFilter() {	return this._params.minFilter;	}

	set magFilter(mValue) {
		this._params.magFilter = mValue;

		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._params.magFilter);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}


	get wrapS() {	return this._params.wrapS;	}

	set wrapS(mValue) {
		this._params.wrapS = mValue;
		this._checkWrapping();

		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._params.wrapS);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}


	get wrapT() {	return this._params.wrapT;	}

	set wrapT(mValue) {
		this._params.wrapT = mValue;
		this._checkWrapping();

		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._params.wrapT);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	get texelType() {	return this._texelType;	}

	get width() {	return this._width;	}

	get height() {	return this._height;	}

	get texture() {	return this._texture;	}

	get isTextureReady() {	return this._isTextureReady;	}

}


function isPowerOfTwo(x) {	
	return (x !== 0) && (!(x & (x - 1)));
};

function getSourceType(mSource) {
	//	possible source type : Image / Video / Unit8Array / Float32Array
	//	this list must be flexible

	let type = GL.UNSIGNED_BYTE;

	if(mSource instanceof Array) {
		type = GL.UNSIGNED_BYTE;
	} else if(mSource instanceof Uint8Array) {
		type = GL.UNSIGNED_BYTE;
	} else if(mSource instanceof Float32Array) {
		type = GL.FLOAT;
	} else if(mSource instanceof HTMLImageElement) {
		type = 'image';
	} else if(mSource instanceof HTMLCanvasElement) {
		type = 'canvas';
	} else if(mSource instanceof HTMLVideoElement) {
		type = 'video';
	}
	return type;
}

let _whiteTexture, _greyTexture, _blackTexture;

GLTexture.whiteTexture = function whiteTexture() {
	if(_whiteTexture === undefined) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 2;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, 2, 2);
		_whiteTexture = new GLTexture(canvas);
	}
	
	return _whiteTexture;
};

GLTexture.greyTexture = function greyTexture() {
	if(_greyTexture === undefined) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 2;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'rgb(127, 127, 127)';
		ctx.fillRect(0, 0, 2, 2);
		_greyTexture = new GLTexture(canvas);
	}
	return _greyTexture;
};

GLTexture.blackTexture = function blackTexture() {
	if(_blackTexture === undefined) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 2;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect(0, 0, 2, 2);
		_blackTexture = new GLTexture(canvas);
	}
	return _blackTexture;
};

export default GLTexture;