// FrameBuffer.js

import GL from './GLTool';
import GLTexture from './GLTexture';
import WebglNumber from './utils/WebglNumber';
import objectAssign from 'object-assign';

let gl;
let webglDepthTexture;
let hasCheckedMultiRenderSupport = false;
let extDrawBuffer;


const checkMultiRender = function () {
	if(GL.webgl2) {
		return true;
	} else {
		extDrawBuffer = GL.getExtension('WEBGL_draw_buffers');
		return !!extDrawBuffer;
	}
	
	hasCheckedMultiRenderSupport = true;
};

class FrameBuffer {

	constructor(mWidth, mHeight, mParameters = {}, mNumTargets = 1) {
		gl = GL.gl;
		webglDepthTexture = GL.checkExtension('WEBGL_depth_texture');

		this.width            = mWidth;
		this.height           = mHeight;
		this._numTargets 	  = mNumTargets;
		this._multipleTargets = mNumTargets > 1;
		this._parameters = mParameters;

		if(!hasCheckedMultiRenderSupport) {
			checkMultiRender();
		}

		if(this._multipleTargets) {
			this._checkMaxNumRenderTarget();
		}

		this._init();
	}


	_init() {
		this._initTextures();
		
		this.frameBuffer        = gl.createFramebuffer();		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

		if(GL.webgl2) {
			// this.renderBufferDepth = gl.createRenderbuffer();
			// gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBufferDepth);
			// gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
			// gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBufferDepth);

			const buffers = [];
			for (let i = 0; i < this._numTargets; i++) {
				gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this._textures[i].texture, 0);
				buffers.push(gl[`COLOR_ATTACHMENT${i}`]);
			}

			gl.drawBuffers(buffers);

			gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.glDepthTexture.texture, 0);

		} else {
			for (let i = 0; i < this._numTargets; i++) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this._textures[i].texture, 0);	
			}

			if(this._multipleTargets) {
				const drawBuffers = [];
				for(let i=0; i<this._numTargets; i++) {
					drawBuffers.push(extDrawBuffer[`COLOR_ATTACHMENT${i}_WEBGL`]);
				}

				extDrawBuffer.drawBuffersWEBGL(drawBuffers);	
			}

			if(webglDepthTexture) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.glDepthTexture.texture, 0);	
			}
		}
		

		//	CHECKING FBO
		const FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if(FBOstatus != gl.FRAMEBUFFER_COMPLETE) {
			console.error('GL_FRAMEBUFFER_COMPLETE failed, CANNOT use Framebuffer', WebglNumber[FBOstatus]);
		}

		//	UNBIND

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		
		//	CLEAR FRAMEBUFFER 

		this.clear();
	}

	_checkMaxNumRenderTarget() {
		const maxNumDrawBuffers = GL.gl.getParameter(extDrawBuffer.MAX_DRAW_BUFFERS_WEBGL);
		if(this._numTargets > maxNumDrawBuffers) {
			console.error('Over max number of draw buffers supported : ', maxNumDrawBuffers);
			this._numTargets = maxNumDrawBuffers;
		}
	}

	_initTextures() {
		this._textures = [];
		for (let i = 0; i < this._numTargets; i++) {
			const glt = this._createTexture();
			this._textures.push(glt);
		}

		
		if(GL.webgl2) { 
			this.glDepthTexture = this._createTexture(gl.DEPTH_COMPONENT16, gl.UNSIGNED_SHORT, gl.DEPTH_COMPONENT, true);
		} else {
			this.glDepthTexture = this._createTexture(gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, gl.DEPTH_COMPONENT, { minFilter:GL.LINEAR });
		}
	}

	_createTexture(mInternalformat, mTexelType, mFormat, mParameters = {}) {
		const parameters = objectAssign({}, this._parameters);
		if(!mFormat) {	mFormat = mInternalformat; }
		
		parameters.internalFormat = mInternalformat || gl.RGBA;
		parameters.format = mFormat;
		parameters.type = mTexelType || parameters.type || GL.UNSIGNED_BYTE;
		for(const s in mParameters) {
			parameters[s] = mParameters[s];
		}

		const texture = new GLTexture(null, parameters, this.width, this.height);
		return texture;
	}

	//	PUBLIC METHODS

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
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		this._textures.forEach(texture => {
			texture.generateMipmap();
		});
	}


	clear(r = 0, g = 0, b = 0, a = 0) {
		this.bind();
		GL.clear(r, g, b, a);
		this.unbind();
	}	


	//	TEXTURES

	getTexture(mIndex = 0) {
		return this._textures[mIndex];
	}

	getDepthTexture() {
		return this.glDepthTexture;
	}

	//	TOUGHTS : Should I remove these from frame buffer ? 
	//	Shouldn't these be set individually to each texture ? 
	//	e.g. fbo.getTexture(0).minFilter = GL.NEAREST;
	//		 fbo.getTexture(1).minFilter = GL.LINEAR; ... etc ? 

	//	MIPMAP FILTER

	get minFilter() {	return this._textures[0].minFilter;	}

	set minFilter(mValue) {
		this._textures.forEach(texture => {
			texture.minFilter = mValue;
		});
	}

	get magFilter() {	return this._textures[0].magFilter;	}

	set magFilter(mValue) {
		this._textures.forEach(texture => {
			texture.magFilter = mValue;
		});
	}


	//	WRAPPING

	get wrapS() {	return this._textures[0].wrapS;	}

	set wrapS(mValue) {
		this._textures.forEach(texture => {
			texture.wrapS = mValue;
		});
	}


	get wrapT() {	return this._textures[0].wrapT;	}

	set wrapT(mValue) {
		this._textures.forEach(texture => {
			texture.wrapT = mValue;
		});
	}

	//	UTILS

	showParameters() {
		this._textures[0].showParameters();
	}

	get numTargets() {	return this._numTargets;	}
}


export default FrameBuffer;