// GLTexture.js

import GL from './GLTool';
import WebglNumber from './utils/WebglNumber';

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
			this._premultiplyAlpha = true;
			this._magFilter = mParameters.magFilter || gl.LINEAR;
			this._minFilter = mParameters.minFilter || gl.NEAREST_MIPMAP_LINEAR;
			
			this._wrapS     = mParameters.wrapS || gl.MIRRORED_REPEAT;
			this._wrapT     = mParameters.wrapT || gl.MIRRORED_REPEAT;
			const width    = mSource.width || mSource.videoWidth;

			if(width) {
				if(!isSourcePowerOfTwo(mSource)) {
					this._wrapS = this._wrapT = gl.CLAMP_TO_EDGE;
					if(this._minFilter === gl.NEAREST_MIPMAP_LINEAR) {
						this._minFilter = gl.LINEAR;
					}
				} 	
			} else {
				this._wrapS = this._wrapT = gl.CLAMP_TO_EDGE;
				if(this._minFilter === gl.NEAREST_MIPMAP_LINEAR) {
					this._minFilter = gl.LINEAR;
				}
			}

			gl.bindTexture(gl.TEXTURE_2D, this._texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

			if(mSource.exposure) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mSource.shape[0], mSource.shape[1], 0, gl.RGBA, gl.FLOAT, mSource.data);
			} else {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mSource);	
				// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			}
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._magFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._minFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._wrapS);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._wrapT);

			// console.log('Texture Min :', WebglNumber[this._minFilter]);
			// console.log('Texture Mag :', WebglNumber[this._magFilter]);

			const ext = GL.getExtension('EXT_texture_filter_anisotropic');
			if(ext) {
				const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
				gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
			}
			
			if(this._canGenerateMipmap()) {
				gl.generateMipmap(gl.TEXTURE_2D);
			}

			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}

	generateMipmap() {
		if (!this._canGenerateMipmap()) { return; }
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}


	//	MIPMAP FILTER

	set minFilter(mValue) {
		if(mValue !== gl.LINEAR
			&& mValue !== gl.NEAREST 
			&& mValue !== gl.NEAREST_MIPMAP_LINEAR
			&& mValue !== gl.NEAREST_MIPMAP_LINEAR
			&& mValue !== gl.LINEAR_MIPMAP_LINEAR
			&& mValue !== gl.NEAREST_MIPMAP_NEAREST
		) { return this; }
		this._minFilter = mValue;
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._minFilter);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	get minFilter() {
		return this._minFilter;
	}

	set magFilter(mValue) {
		if(mValue !== gl.LINEAR && mValue !== gl.NEAREST) { return this; }
		this._magFilter = mValue;
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._magFilter);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	get magFilter() {
		return this._magFilter;
	}


	//	WRAP

	set wrapS(mValue) {
		if(mValue !== gl.CLAMP_TO_EDGE && mValue !== gl.REPEAT && mValue !== gl.MIRRORED_REPEAT) { return this; }
		this._wrapS = mValue;
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._wrapS);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	get wrapS() {
		return this._wrapS;
	}

	set wrapT(mValue) {
		if(mValue !== gl.CLAMP_TO_EDGE && mValue !== gl.REPEAT && mValue !== gl.MIRRORED_REPEAT) { return this; }
		this._wrapT = mValue;
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._wrapT);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	get wrapT() {
		return this._wrapT;
	}


	//	PREMULTIPLY ALPHA

	set premultiplyAlpha(mValue) {
		this._premultiplyAlpha = mValue;
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		console.log('premultiplyAlpha:', mValue);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this._premultiplyAlpha);
		gl.bindTexture(gl.TEXTURE_2D, null);

	}

	get premultiplyAlpha() {
		return this._premultiplyAlpha;
	}

	//	UPDATE TEXTURE

	updateTexture(mSource) {
		if(mSource) { this._mSource = mSource; }
		gl.bindTexture(gl.TEXTURE_2D, this._texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._mSource);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this._magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this._minFilter);
		if(this._canGenerateMipmap()) {
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

	_canGenerateMipmap() {
		return this._minFilter === gl.LINEAR_MIPMAP_NEAREST 
				|| this._minFilter === gl.NEAREST_MIPMAP_LINEAR 
				|| this._minFilter === gl.LINEAR_MIPMAP_LINEAR 
				|| this._minFilter === gl.NEAREST_MIPMAP_NEAREST;
	}

	//	GETTER

	get texture() {	return this._texture;	}
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
		ctx.fillStyle = 'rgb(127, 127, 127)';
		ctx.fillRect(0, 0, 4, 4);
		_blackTexture = new GLTexture(canvas);
	}
	return _blackTexture;
};

export default GLTexture;