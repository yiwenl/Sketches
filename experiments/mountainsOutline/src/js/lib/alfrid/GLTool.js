// GLTool.js

import glm from 'gl-matrix';
import exposeAttributes from './utils/exposeAttributes';
import getFloat from './utils/getFloat';
import getHalfFloat from './utils/getHalfFloat';

let gl;

const getAttribLoc = function (gl, shaderProgram, name) {
	if(shaderProgram.cacheAttribLoc === undefined) {	shaderProgram.cacheAttribLoc = {};	}
	if(shaderProgram.cacheAttribLoc[name] === undefined) {
		shaderProgram.cacheAttribLoc[name] = gl.getAttribLocation(shaderProgram, name);
	}

	return shaderProgram.cacheAttribLoc[name];
};

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
		this._useWebGL2 			 = false;
		this._hasArrayInstance;
		this._extArrayInstance;
		this._hasCheckedExt = false;
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

		let ctx;
		if(mParameters.ignoreWebgl2) {
			ctx = this.canvas.getContext('webgl', mParameters) || this.canvas.getContext('experimental-webgl', mParameters);
		} else {
			ctx = this.canvas.getContext('experimental-webgl2', mParameters) || this.canvas.getContext('webgl2', mParameters);
			if(ctx) {
				this._useWebGL2 = true;
			} else {
				ctx = this.canvas.getContext('webgl', mParameters) || this.canvas.getContext('experimental-webgl', mParameters);
			}
			
		}

		console.log('Using WebGL 2 ?', this.webgl2);
		if(this.webgl2) {
			window.gl = ctx;
		}

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
			'OES_vertex_array_object', 
			'ANGLE_instanced_arrays', 
			'WEBGL_draw_buffers'
		];

		this.extensions = {};
		for(let i = 0; i < extensions.length; i++) {
			this.extensions[extensions[i]] = gl.getExtension(extensions[i]);
		}
		
		//	Copy gl Attributes
		exposeAttributes();
		
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
		if(!this.webgl2) {
			if(!this._hasCheckedExt) {
				const ext = this.getExtension('ANGLE_instanced_arrays');
				if (!ext) {
					this._hasArrayInstance = false;
				} else {
					this._hasArrayInstance = true;
					this._extArrayInstance = ext;
				}
				this._hasCheckedExt = true;
			}

			if(!this._hasArrayInstance) {
				console.warn('Extension : ANGLE_instanced_arrays is not supported with this device !');
				return;
			}
		}

		if(mMesh.length) {
			for(let i = 0; i < mMesh.length; i++) {
				this.draw(mMesh[i]);
			}
			return;
		}


		this._bindBuffers(mMesh);


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

		if(mMesh.isInstanced) {
			//	DRAWING
			if(this.webgl2) {
				gl.drawElementsInstanced(mMesh.drawType, mMesh.iBuffer.numItems, gl.UNSIGNED_SHORT, 0, mMesh.numInstance);
			} else {
				this._extArrayInstance.drawElementsInstancedANGLE(mMesh.drawType, mMesh.iBuffer.numItems, gl.UNSIGNED_SHORT, 0, mMesh.numInstance);	
			}
			
		} else {
			if(drawType === gl.POINTS) {
				gl.drawArrays(drawType, 0, mMesh.vertexSize);	
			} else {
				gl.drawElements(drawType, mMesh.iBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
			}	
		}

		this._unbindBUffers(mMesh);
	}


	drawTransformFeedback(mTransformObject) {
		const toLog = Math.random() > .995;

		const { meshSource, meshDestination, numPoints, transformFeedback } = mTransformObject;
		
		//	BIND SOURCE BUFFERS -> setupVertexAttr(sourceVAO)
		meshSource.generateBuffers(this.shaderProgram);

		// this._bindBuffers(meshSource);
		meshDestination.generateBuffers(this.shaderProgram);

		meshSource.attributes.forEach((attr, i) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
			gl.vertexAttribPointer(i, attr.itemSize, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(i);
		});

		//	BIND DESTINATION BUFFERS
		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

		meshDestination.attributes.forEach((attr, i)=> {
			gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, attr.buffer);
		});

		gl.enable(gl.RASTERIZER_DISCARD);

		gl.beginTransformFeedback(gl.POINTS);
		gl.drawArrays(gl.POINTS, 0, numPoints);
		gl.endTransformFeedback();	
		

		//	reset state
		gl.disable(gl.RASTERIZER_DISCARD);
		gl.useProgram(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		meshDestination.attributes.forEach((attr, i)=> {
			gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, i, null);
		});
		gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

		this._unbindBUffers(meshSource);
	}


	_bindBuffers(mMesh) {
		//	CHECK IF MESH HAS CREATE BUFFERS
		mMesh.generateBuffers(this.shaderProgram);
		this.attrPositionToReset = [];

		if(mMesh.hasVAO) {
			if(this.webgl2) {
				gl.bindVertexArray(mMesh.vao); 
			} else {
				if(!this._extVAO) {
					this._extVAO = this.getExtension('OES_vertex_array_object');
				}
				this._extVAO.bindVertexArrayOES(mMesh.vao); 
			}
			
		} else {
			if(this._lastMesh === mMesh) {	return;	}
			
			mMesh.attributes.forEach((attribute)=> {
				gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
				const attrPosition = getAttribLoc(gl, this.shaderProgram, attribute.name);
				gl.vertexAttribPointer(attrPosition, attribute.itemSize, gl.FLOAT, false, 0, 0);

				if(attribute.isInstanced) {
					if(this.webgl2) {
						gl.vertexAttribDivisor(attrPosition, 1);	
					} else {
						this._extArrayInstance.vertexAttribDivisorANGLE(attrPosition, 1);		
					}
					
					this.attrPositionToReset.push(attrPosition);
				}

				if(this._enabledVertexAttribute.indexOf(attrPosition) === -1) {
					gl.enableVertexAttribArray(attrPosition);
					this._enabledVertexAttribute.push(attrPosition);
				}
			});

			//	BIND INDEX BUFFER
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mMesh.iBuffer);	
		}

		this._lastMesh = mMesh;
	}

	_unbindBUffers(mMesh) {
		if(mMesh.hasVAO) {
			if(this.webgl2) {
				gl.bindVertexArray(null);
			} else {
				this._extVAO.bindVertexArrayOES(null);
			}

			mMesh.resetInstanceDivisor();
		} else {
			this.attrPositionToReset.map((attrPos) => {
				if(this.webgl2) {
					gl.vertexAttribDivisor(attrPos, 0);
				} else {
					this._extArrayInstance.vertexAttribDivisorANGLE(attrPos, 0);	
				}
			});
		}
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

	get FLOAT() { return getFloat(); }
	
	get HALF_FLOAT() { return getHalfFloat(); }

	get width() {	return this._width;		}

	get height() {	return this._height;	}

	get aspectRatio() {	return this._aspectRatio;	}

	get webgl2() {	return this._useWebGL2;	}

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
