// CubeFrameBuffer.js

'use strict';

import GL from './GLTool';
import GLCubeTexture from './GLCubeTexture';

let gl;


class CubeFrameBuffer {

	constructor(size, mParameters = {}) {
		gl = GL.gl;
		this._size = size;
		this.magFilter = mParameters.magFilter || gl.LINEAR;
		this.minFilter = mParameters.minFilter || gl.LINEAR;
		this.wrapS     = mParameters.wrapS || gl.CLAMP_TO_EDGE;
		this.wrapT     = mParameters.wrapT || gl.CLAMP_TO_EDGE;

		this._init();
	}


	_init() {
		this.texture   = gl.createTexture();
		this.glTexture = new GLCubeTexture(this.texture, {}, true);

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this.magFilter);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this.minFilter);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.wrapS);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.wrapT);

		const targets = [
			gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
			gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
			gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
		];

		for(let i = 0; i < targets.length; i++) {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			gl.texImage2D(targets[i], 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null);
		}


		this._frameBuffers = [];
		for(let i = 0; i < targets.length; i++) {
			const frameBuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, targets[i], this.texture, 0);

			const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			if (status !== gl.FRAMEBUFFER_COMPLETE) {
				console.log(`'gl.checkFramebufferStatus() returned '${status}`);
			}

			this._frameBuffers.push(frameBuffer);
		}

		// gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	}


	bind(mTargetIndex) {

		// if(Math.random() > .99) console.log('bind :', mTargetIndex, this._frameBuffers[mTargetIndex]);
		GL.viewport(0, 0, this.width, this.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffers[mTargetIndex]);
	}

	unbind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		GL.viewport(0, 0, GL.width, GL.height);
	}

	//	TEXTURES

	getTexture() {
		return this.glTexture;
	}

	//	GETTERS AND SETTERS

	get width() {
		return this._size;
	}

	get height() {
		return this._size;
	}
}


export default CubeFrameBuffer;