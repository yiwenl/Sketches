// GLTexture.js

'use strict';

import GL from './GLTool';

function isPowerOfTwo(x) {	
	return (x !== 0) && (!(x & (x - 1)));
};

function isSourcePowerOfTwo(obj) {	
	const w = obj.width || obj.videoWidth;
	const h = obj.height || obj.videoHeight;

	if(!w || !h) { return false; }

	return isPowerOfTwo(w) && isPowerOfTwo(h);
};

let gl;

class GLTexture {

	constructor(mSource, isTexture = false, mParameters = {}) {
		gl = GL.gl;

		if(isTexture) {
			this._texture = mSource;
		} else {
			this._mSource  = mSource;
			this._texture  = gl.createTexture();
			this._isVideo  = (mSource.tagName === 'VIDEO');
			this.magFilter = mParameters.magFilter || gl.LINEAR;
			this.minFilter = mParameters.minFilter || gl.LINEAR_MIPMAP_NEAREST;
			
			this.wrapS     = mParameters.wrapS || gl.REPEAT;
			this.wrapT     = mParameters.wrapT || gl.REPEAT;
			const width    = mSource.width || mSource.videoWidth;

			if(width) {
				if(!isSourcePowerOfTwo(mSource)) {
					this.wrapS = this.wrapT = gl.CLAMP_TO_EDGE;
					if(this.minFilter === gl.LINEAR_MIPMAP_NEAREST) {
						this.minFilter = gl.LINEAR;
					}
				} 	
			} else {
				this.wrapS = this.wrapT = gl.CLAMP_TO_EDGE;
				if(this.minFilter === gl.LINEAR_MIPMAP_NEAREST) {
					this.minFilter = gl.LINEAR;
				}
			}

			gl.bindTexture(gl.TEXTURE_2D, this._texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

			if(mSource.exposure) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mSource.shape[0], mSource.shape[1], 0, gl.RGBA, gl.FLOAT, mSource.data);
			} else {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mSource);	
			}
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);

			const ext = GL.getExtension('EXT_texture_filter_anisotropic');
			if(ext) {
				const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
				gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
			}
			
			if(this.minFilter === gl.LINEAR_MIPMAP_NEAREST)	{
				gl.generateMipmap(gl.TEXTURE_2D);
			}

			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}


	//	MIPMAP FILTER

	minFilter(mValue) {
		if(mValue !== gl.LINEAR && mValue !== gl.NEAREST && mValue !== gl.LINEAR_MIPMAP_NEAREST) { return this; }
		this.minFilter = mValue;
		return this;
	}

	magFilter(mValue) {
		if(mValue !== gl.LINEAR && mValue !== gl.NEAREST && mValue !== gl.LINEAR_MIPMAP_NEAREST) { return this; }
		this.magFilter = mValue;
		return this;
	}


	//	WRAP

	wrapS(mValue) {
		if(mValue !== gl.CLAMP_TO_EDGE && mValue !== gl.REPEAT && mValue !== gl.MIRRORED_REPEAT) { return this; }
		this.wrapS = mValue;
		return this;
	}

	wrapT(mValue) {
		if(mValue !== gl.CLAMP_TO_EDGE && mValue !== gl.REPEAT && mValue !== gl.MIRRORED_REPEAT) { return this; }
		this.wrapT = mValue;
		return this;
	}


	//	UPDATE TEXTURE

	updateTexture(mSource) {
		if(mSource) { this._mSource = mSource; }
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._mSource);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
		if(this.minFilter === gl.LINEAR_MIPMAP_NEAREST)	{
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
	}


	bind(index) {
		if(index === undefined) { index = 0; }
		if(!GL.shader) { return; }

		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		this._bindIndex = index;
	}

	//	GETTER

	get texture() {	return this._texture;	}
	get source() { return this._mSource; }
}


let _whiteTexture, _greyTexture, _blackTexture;

GLTexture.whiteTexture = function whiteTexture() {
	if(_whiteTexture === undefined) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 4;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, 4, 4);
		_whiteTexture = new GLTexture(canvas);
	}
	
	return _whiteTexture;
};

GLTexture.greyTexture = function greyTexture() {
	if(_greyTexture === undefined) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 4;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'rgb(127, 127, 127)';
		ctx.fillRect(0, 0, 4, 4);
		_greyTexture = new GLTexture(canvas);
	}
	return _greyTexture;
};

GLTexture.blackTexture = function blackTexture() {
	if(_blackTexture === undefined) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 4;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect(0, 0, 4, 4);
		_blackTexture = new GLTexture(canvas);
	}
	return _blackTexture;
};

export default GLTexture;