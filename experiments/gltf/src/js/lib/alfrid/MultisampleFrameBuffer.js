// MultisampleFrameBuffer.js

import GL from './GLTool';
import GLTexture from './GLTexture';

let gl;

function isPowerOfTwo(x) {	
	return (x !== 0) && (!(x & (x - 1)));
};

class MultisampleFrameBuffer {
	constructor(mWidth, mHeight, mParameters = {}) {
		gl = GL.gl;

		this.width            = mWidth;
		this.height           = mHeight;

		this.magFilter  = mParameters.magFilter 	|| gl.LINEAR;
		this.minFilter  = mParameters.minFilter 	|| gl.LINEAR;
		this.wrapS      = mParameters.wrapS 		|| gl.CLAMP_TO_EDGE;
		this.wrapT      = mParameters.wrapT 		|| gl.CLAMP_TO_EDGE;
		this.useDepth   = mParameters.useDepth 		|| true;
		this.useStencil = mParameters.useStencil 	|| false;
		this.texelType 	= mParameters.type;
		this._numSample = mParameters.numSample 	|| 8;

		if(!isPowerOfTwo(this.width) || !isPowerOfTwo(this.height)) {
			this.wrapS = this.wrapT = gl.CLAMP_TO_EDGE;

			if(this.minFilter === gl.LINEAR_MIPMAP_NEAREST) {
				this.minFilter = gl.LINEAR;
			}
		} 

		this._init();
	}

	_init() {
		let texelType = gl.UNSIGNED_BYTE;
		if (this.texelType) {
			texelType = this.texelType;
		}

		this.texelType = texelType;

		this.frameBuffer        = gl.createFramebuffer();	
		this.frameBufferColor   = gl.createFramebuffer();	
		this.renderBufferColor  = gl.createRenderbuffer();
		this.renderBufferDepth  = gl.createRenderbuffer();
		this.glTexture 			= this._createTexture();
		this.glDepthTexture 	= this._createTexture(gl.DEPTH_COMPONENT16, gl.UNSIGNED_SHORT, gl.DEPTH_COMPONENT, true);

		gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBufferColor);
		gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this._numSample, gl.RGBA8, this.width, this.height);

		gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBufferDepth);
		gl.renderbufferStorageMultisample(gl.RENDERBUFFER, this._numSample, gl.DEPTH_COMPONENT16, this.width, this.height);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.renderBufferColor);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBufferDepth);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferColor);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glTexture.texture, 0);
		// gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.glDepthTexture.texture, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		// gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferDepth);
		// gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.glDepthTexture.texture, 0);
		// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	_createTexture(mInternalformat, mTexelType, mFormat, forceNearest = false) {
		if(mInternalformat === undefined) {	mInternalformat = gl.RGBA;	}
		if(mTexelType === undefined) {	mTexelType = this.texelType;	}
		if(!mFormat) {	mFormat = mInternalformat; }

		const t = gl.createTexture();
		const glt = new GLTexture(t, true);
		const magFilter = forceNearest ? GL.NEAREST : this.magFilter;
		const minFilter = forceNearest ? GL.NEAREST : this.minFilter;

		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
		gl.texImage2D(gl.TEXTURE_2D, 0, mInternalformat, this.width, this.height, 0, mFormat, mTexelType, null);	
		gl.bindTexture(gl.TEXTURE_2D, null);

		return glt;
	}


	bind(mAutoSetViewport=true) {
		if(mAutoSetViewport) {
			GL.viewport(0, 0, this.width, this.height);	
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
	}


	unbind(mAutoSetViewport=true) {
		if(mAutoSetViewport) {
			GL.viewport(0, 0, GL.width, GL.height);	
		}

		const { width, height } = this;

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.frameBuffer);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.frameBufferColor);
		gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);
		gl.blitFramebuffer(
			0, 0, width, height,
			0, 0, width, height,
			gl.COLOR_BUFFER_BIT, GL.NEAREST
		);
		// gl.blitFramebuffer(
		// 	0, 0, width, height,
		// 	0, 0, width, height,
		// 	gl.COLOR_BUFFER_BIT|gl.DEPTH_STENCIL, GL.NEAREST
		// );

		// gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.frameBuffer);
		// gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.frameBufferDepth);
		// gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);
		// gl.blitFramebuffer(
		// 	0, 0, width, height,
		// 	0, 0, width, height,
		// 	gl.DEPTH_BUFFER_BIT, gl.NEAREST
		// );

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}


	getTexture(mIndex = 0) {
		return this.glTexture;
	}


	getDepthTexture() {
		return this.glDepthTexture;
	}

}


export default MultisampleFrameBuffer;