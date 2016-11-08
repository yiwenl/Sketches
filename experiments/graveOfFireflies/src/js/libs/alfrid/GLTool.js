// GLTool.js

import glm from 'gl-matrix';

let gl;

const offsets = new Float32Array([
	0.0, 0.0, 0.1,
	1.0, 0.0, 0.2,
	2.0, 0.0, 0.3,
	3.0, 0.0, 0.4
]);

const colors = new Float32Array([
	1.0, 0.0, 0.0, 1.0, // Red monkey
	0.0, 1.0, 0.0, 1.0, // Green monkey
	0.0, 0.0, 1.0, 1.0, // Blue monkey
	1.0, 1.0, 1.0, 1.0, // White monkey
]);

const getAttribLoc = function (gl, shaderProgram, name) {
	if(shaderProgram.cacheAttribLoc === undefined) {	shaderProgram.cacheAttribLoc = {};	}
	if(shaderProgram.cacheAttribLoc[name] === undefined) {
		shaderProgram.cacheAttribLoc[name] = gl.getAttribLocation(shaderProgram, name);
	}

	return shaderProgram.cacheAttribLoc[name];
};

let offsetBuffer, colorBuffer;

class GLTool {

	constructor() {
		this.canvas;
		this._viewport               = [0, 0, 0, 0];
		this._enabledVertexAttribute = [];
		this.identityMatrix          = glm.mat4.create();
		this._normalMatrix           = glm.mat3.create();
		this._inverseModelViewMatrix = glm.mat3.create();
		this._modelMatrix            = glm.mat4.create();
		this._matrix                 = glm.mat4.create();
		this._lastMesh				 = null;
		glm.mat4.identity(this.identityMatrix, this.identityMatrix);

		this.isMobile = false;
		if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			this.isMobile = true;
		}
	}

	//	INITIALIZE

	init(mCanvas, mParameters = {}) {

		if(mCanvas === null || mCanvas === undefined) {
			console.error('Canvas not exist');
			return;
		}
		
		if(this.canvas !== undefined && this.canvas !== null) {
			this.destroy();
		}
		
		this.canvas = mCanvas;
		this.setSize(window.innerWidth, window.innerHeight);
		const ctx = this.canvas.getContext('webgl', mParameters) || this.canvas.getContext('experimental-webgl', mParameters);

		//	extensions
		this.initWithGL(ctx);
	}

	initWithGL(ctx) {
		if(!this.canvas) {	this.canvas = ctx.canvas;	}
		gl = this.gl = ctx;
		const extensions = [
			'EXT_shader_texture_lod', 
			'EXT_sRGB', 
			'EXT_frag_depth', 
			'OES_texture_float', 
			'OES_texture_half_float', 
			'OES_texture_float_linear', 
			'OES_texture_half_float_linear', 
			'OES_standard_derivatives', 
			'WEBGL_depth_texture', 
			'EXT_texture_filter_anisotropic', 
			'ANGLE_instanced_arrays', 
			'WEBGL_draw_buffers'
		];

		this.extensions = {};
		for(let i = 0; i < extensions.length; i++) {
			this.extensions[extensions[i]] = gl.getExtension(extensions[i]);
		}
		

		//	Copy gl Attributes
		this.VERTEX_SHADER         = gl.VERTEX_SHADER;
		this.FRAGMENT_SHADER       = gl.FRAGMENT_SHADER;
		this.COMPILE_STATUS        = gl.COMPILE_STATUS;
		this.DEPTH_TEST            = gl.DEPTH_TEST;
		this.CULL_FACE             = gl.CULL_FACE;
		this.BLEND                 = gl.BLEND;
		this.POINTS                = gl.POINTS;
		this.LINES                 = gl.LINES;
		this.TRIANGLES             = gl.TRIANGLES;
		
		this.LINEAR                = gl.LINEAR;
		this.NEAREST               = gl.NEAREST;
		this.LINEAR_MIPMAP_NEAREST = gl.LINEAR_MIPMAP_NEAREST;
		this.MIRRORED_REPEAT       = gl.MIRRORED_REPEAT;
		this.CLAMP_TO_EDGE         = gl.CLAMP_TO_EDGE;
		this.SCISSOR_TEST		   = gl.SCISSOR_TEST;
		

		this.enable(this.DEPTH_TEST);
		this.enable(this.CULL_FACE);
		this.enable(this.BLEND);
	} 



	//	PUBLIC METHODS

	setViewport(x, y, w, h) {
		let hasChanged = false;
		if(x !== this._viewport[0]) { hasChanged = true; }
		if(y !== this._viewport[1]) { hasChanged = true; }
		if(w !== this._viewport[2]) { hasChanged = true; }
		if(h !== this._viewport[3]) { hasChanged = true; }

		if(hasChanged) {
			gl.viewport(x, y, w, h);
			this._viewport = [x, y, w, h];
		}
	}

	scissor(x, y, w, h) {
		gl.scissor(x, y, w, h);
	}


	clear(r, g, b, a) {
		gl.clearColor(r, g, b, a);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}


	setMatrices(mCamera) {
		this.camera = mCamera;
		this.rotate(this.identityMatrix);
	}


	useShader(mShader) {
		this.shader = mShader;
		this.shaderProgram = this.shader.shaderProgram;
	}


	rotate(mRotation) {
		glm.mat4.copy(this._modelMatrix, mRotation);
		glm.mat4.multiply(this._matrix, this.camera.matrix, this._modelMatrix);
		glm.mat3.fromMat4(this._normalMatrix, this._matrix);
		glm.mat3.invert(this._normalMatrix, this._normalMatrix);
		glm.mat3.transpose(this._normalMatrix, this._normalMatrix);

		glm.mat3.fromMat4(this._inverseModelViewMatrix, this._matrix);
		glm.mat3.invert(this._inverseModelViewMatrix, this._inverseModelViewMatrix);
	}


	draw(mMesh, mDrawingType) {
		if(mMesh.length) {
			for(let i = 0; i < mMesh.length; i++) {
				this.draw(mMesh[i]);
			}
			return;
		}

		if(mMesh.instancedAttributes.length > 0) {
			this.drawInstance(mMesh);
			return;
		}

		if(mMesh.vao) {
			this._bindVao(mMesh);
		} else {
			if (this._lastMesh !== mMesh) {
				this._bindBuffers(mMesh);
			}	
		}

		

		//	DEFAULT MATRICES
		if(this.camera !== undefined) {
			this.shader.uniform('uProjectionMatrix', 'mat4', this.camera.projection);	
			this.shader.uniform('uViewMatrix', 'mat4', this.camera.matrix);
		}
		
		this.shader.uniform('uModelMatrix', 'mat4', this._modelMatrix);
		this.shader.uniform('uNormalMatrix', 'mat3', this._normalMatrix);
		this.shader.uniform('uModelViewMatrixInverse', 'mat3', this._inverseModelViewMatrix);

		let drawType = mMesh.drawType;
		if(mDrawingType !== undefined) {
			drawType = mDrawingType;
		}
		
		//	DRAWING
		if(drawType === gl.POINTS) {
			gl.drawArrays(drawType, 0, mMesh.vertexSize);	
		} else {
			gl.drawElements(drawType, mMesh.iBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
		}

		if(mMesh.vao) {
			this._unbindVao(mMesh);
		}
	}


	drawInstance(mMesh) {
		const ext = this.getExtension('ANGLE_instanced_arrays');
		if (!ext) {
			console.warn('Extension : ANGLE_instanced_arrays is not supported with this device !');
			return;
		}

		if(mMesh.length) {
			for(let i = 0; i < mMesh.length; i++) {
				this.drawInstance(mMesh[i], mDrawingType);
			}
			return;
		}

		const attrPositionToReset = [];

		if (this._lastMesh !== mMesh) {
			this._bindBuffers(mMesh);
		}

		let instanceCount = 1;
		//	INSTANCE ATTRIBUTES
		for(let i = 0; i < mMesh.instancedAttributes.length; i++) {

			const attribute = mMesh.instancedAttributes[i];
			gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
			const attrPosition = getAttribLoc(gl, this.shaderProgram, attribute.name);
			gl.vertexAttribPointer(attrPosition, attribute.itemSize, gl.FLOAT, false, attribute.itemSize * 4, 0);
			ext.vertexAttribDivisorANGLE(attrPosition, 1);
			attrPositionToReset.push(attrPosition);
			
			if(this._enabledVertexAttribute.indexOf(attrPosition) === -1) {
				gl.enableVertexAttribArray(attrPosition);
				this._enabledVertexAttribute.push(attrPosition);
			}
			
			instanceCount = attribute.numInstance;
		}

		this._instanceCount = instanceCount;

		//	DEFAULT MATRICES
		if(this.camera !== undefined) {
			this.shader.uniform('uProjectionMatrix', 'mat4', this.camera.projection);	
			this.shader.uniform('uViewMatrix', 'mat4', this.camera.matrix);
		}
		
		this.shader.uniform('uModelMatrix', 'mat4', this._modelMatrix);
		this.shader.uniform('uNormalMatrix', 'mat3', this._normalMatrix);
		this.shader.uniform('uModelViewMatrixInverse', 'mat3', this._inverseModelViewMatrix);

		ext.drawElementsInstancedANGLE(mMesh.drawType, mMesh.iBuffer.numItems, gl.UNSIGNED_SHORT, 0, this._instanceCount);

		attrPositionToReset.map((attrPos) => {
			ext.vertexAttribDivisorANGLE(attrPos, 0);
		});
	}

	_bindVao(mMesh) {
		mMesh.bindVAO();
	}

	_unbindVao(mMesh) {
		mMesh.unbindVAO();
	}

	_bindBuffers(mMesh) {
		//	ATTRIBUTES
		for(let i = 0; i < mMesh.attributes.length; i++) {

			const attribute = mMesh.attributes[i];
			gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
			const attrPosition = getAttribLoc(gl, this.shaderProgram, attribute.name);
			gl.vertexAttribPointer(attrPosition, attribute.itemSize, gl.FLOAT, false, 0, 0);

			if(this._enabledVertexAttribute.indexOf(attrPosition) === -1) {
				gl.enableVertexAttribArray(attrPosition);
				this._enabledVertexAttribute.push(attrPosition);
			}
		}

		//	BIND INDEX BUFFER
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mMesh.iBuffer);

		this._lastMesh = mMesh;
	}

	setSize(mWidth, mHeight) {
		this._width        = mWidth;
		this._height       = mHeight;
		this.canvas.width  = this._width;
		this.canvas.height = this._height;
		this._aspectRatio  = this._width / this._height;

		if(gl) {
			this.viewport(0, 0, this._width, this._height);	
		}
		
	}


	showExtensions() {
		console.log('Extensions : ', this.extensions);
		for(const ext in this.extensions) {
			if(this.extensions[ext]) {
				console.log(ext, ':', this.extensions[ext]);	
			}
		}	
	}

	checkExtension(mExtension) {
		return !!this.extensions[mExtension];
	}


	getExtension(mExtension) {
		return this.extensions[mExtension];
	}

	//	BLEND MODES

	enableAlphaBlending() {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
	}

	enableAdditiveBlending() {
		gl.blendFunc(gl.ONE, gl.ONE);
	}


	//	GL NATIVE FUNCTIONS

	enable(mParameter) {	gl.enable(mParameter);		}

	disable(mParameter) {	gl.disable(mParameter);	}

	viewport(x, y, w, h) {	this.setViewport(x, y, w, h);	}


	//	GETTER AND SETTERS

	get width() {	return this._width;		}

	get height() {	return this._height;	}

	get aspectRatio() {	return this._aspectRatio;	}

	//	DESTROY

	destroy() {
		
		if(this.canvas.parentNode) {
			try {
				this.canvas.parentNode.removeChild(this.canvas);
			} catch (e) {
				console.log('Error : ', e);
			}
		}

		this.canvas = null;
	}
}

const GL = new GLTool();

export default GL;
