// FrameBuffer.js

'use strict';

import GL from './GLTool';
import GLTexture from './GLTexture';

function isPowerOfTwo(x) {	
	return (x !== 0) && (!(x & (x - 1)));
};

let gl;
let webglDepthTexture;

class FrameBuffer {

	constructor(mWidth, mHeight, mParameters = {}, multipleTargets = false) {
		gl = GL.gl;
		webglDepthTexture = GL.checkExtension('WEBGL_depth_texture');

		this.width            = mWidth;
		this.height           = mHeight;
		this._multipleTargets = multipleTargets;

		this.magFilter  = mParameters.magFilter 	|| gl.LINEAR;
		this.minFilter  = mParameters.minFilter 	|| gl.LINEAR;
		this.wrapS      = mParameters.wrapS 		|| gl.CLAMP_TO_EDGE;
		this.wrapT      = mParameters.wrapT 		|| gl.CLAMP_TO_EDGE;
		this.useDepth   = mParameters.useDepth 		|| true;
		this.useStencil = mParameters.useStencil 	|| false;
		this.texelType 	= mParameters.type;

		if(!isPowerOfTwo(this.width) || !isPowerOfTwo(this.height)) {
			this.wrapS = this.wrapT = gl.CLAMP_TO_EDGE;

			if(this.minFilter === gl.LINEAR_MIPMAP_NEAREST) {
				this.minFilter = gl.LINEAR;
			}
		} 

		this._init();
	}


	_init() {
		this._textures = [];

		if (!this._multipleTargets) {
			this.texture            = gl.createTexture();
			this.glTexture			= new GLTexture(this.texture, true);
			this._textures.push(this.glTexture);
		} else {
			for (let i = 0; i < 4; i++) {
				const t = gl.createTexture();
				const glt = new GLTexture(t, true);
				this._textures.push(glt);
			}
		}

		this.depthTexture       = gl.createTexture();
		this.glDepthTexture		= new GLTexture(this.depthTexture, true);
		
		this.frameBuffer        = gl.createFramebuffer();		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

		const extDrawBuffer = GL.getExtension('WEBGL_draw_buffers');
		if (!extDrawBuffer && this._multipleTargets) {
			console.error('Browser not supporting multiple rendering targets !');
		}

		//	SETUP TEXTURE MIPMAP, WRAP

		let texelType = gl.UNSIGNED_BYTE;
		const extHalfFloat = GL.getExtension('OES_texture_half_float');

		if (GL.checkExtension('OES_texture_float')) {
			texelType = gl.FLOAT;
		} else if(extHalfFloat) {
			texelType = extHalfFloat.HALF_FLOAT_OES;
		}


		if (GL.isMobile && texelType === gl.FLOAT && extHalfFloat) {
			texelType = extHalfFloat.HALF_FLOAT_OES;
		}

		if (this.texelType) {
			texelType = this.texelType;
		}

		for (let i = 0; i < this._textures.length; i++) {
			gl.bindTexture(gl.TEXTURE_2D, this._textures[i].texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, texelType, null);	
		}

		

		if(webglDepthTexture) {
			gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);	
		}
		

		//	GET COLOUR

		for (let i = 0; i < this._textures.length; i++) {
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this._textures[i].texture, 0);
		}
		if (this._multipleTargets) {
			extDrawBuffer.drawBuffersWEBGL([
				extDrawBuffer.COLOR_ATTACHMENT0_WEBGL, // gl_FragData[0]
				extDrawBuffer.COLOR_ATTACHMENT1_WEBGL, // gl_FragData[1]
				extDrawBuffer.COLOR_ATTACHMENT2_WEBGL, // gl_FragData[2]
				extDrawBuffer.COLOR_ATTACHMENT3_WEBGL  // gl_FragData[3]
			]);
		}
		

		//	GET DEPTH

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);


		if(this.minFilter === gl.LINEAR_MIPMAP_NEAREST)	{
			for (let i = 0; i < this._textures.length; i++) {
				gl.bindTexture(gl.TEXTURE_2D, this._textures[i].texture);
				gl.generateMipmap(gl.TEXTURE_2D);
			}
		}


		//	CHECKING FBO
		const FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if(FBOstatus != gl.FRAMEBUFFER_COMPLETE) {
			console.log('GL_FRAMEBUFFER_COMPLETE failed, CANNOT use Framebuffer');
		}

		//	UNBIND

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		
		//	CLEAR FRAMEBUFFER 

		this.clear();
	}


	//	PUBLIC METHODS

	bind() {
		GL.viewport(0, 0, this.width, this.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
	}


	unbind() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		GL.viewport(0, 0, GL.width, GL.height);
	}


	clear(r = 0, g = 0, b = 0, a = 0) {
		this.bind();
		GL.clear(r, g, b, a);
		this.unbind();
	}	


	//	TEXTURES

	getTexture(mIndex = 0) {
		// return this._textures.length == 1 ? this.glTexture : this._textures;
		return this._textures[mIndex];
	}

	getDepthTexture() {
		return this.glDepthTexture;
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


}


export default FrameBuffer;