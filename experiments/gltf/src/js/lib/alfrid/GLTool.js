// GLTool.js

import { mat4, mat3 } from 'gl-matrix';

import getAndApplyExtension from './utils/getAndApplyExtension';
import exposeAttributes from './utils/exposeAttributes';
import getFloat from './utils/getFloat';
import getHalfFloat from './utils/getHalfFloat';
import getAttribLoc from './utils/getAttribLoc';
import ExtensionsList from './utils/ExtensionsList';

import Geometry from './Geometry';
import Mesh from './Mesh';
import Object3D from './objects/Object3D';

let gl;

class GLTool {

	constructor() {
		this.canvas;
		this._viewport               = [0, 0, 0, 0];
		this._enabledVertexAttribute = [];
		this.identityMatrix          = mat4.create();
		this._normalMatrix           = mat3.create();
		this._inverseModelViewMatrix = mat3.create();
		this._modelMatrix            = mat4.create();
		this._matrix                 = mat4.create();
		this._matrixStacks 			 = [];
		this._lastMesh				 = null;
		this._useWebGL2 			 = false;
		this._hasArrayInstance;
		this._extArrayInstance;
		this._hasCheckedExt = false;
		mat4.identity(this.identityMatrix, this.identityMatrix);

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

		mParameters.useWebgl2 = mParameters.useWebgl2 || false;

		let ctx;
		if(mParameters.useWebgl2) {
			ctx = this.canvas.getContext('experimental-webgl2', mParameters) || this.canvas.getContext('webgl2', mParameters);

			if(!ctx) {
				ctx = this.canvas.getContext('webgl', mParameters) || this.canvas.getContext('experimental-webgl', mParameters);	
				this._useWebGL2 = false;
			} else {
				this._useWebGL2 = true;
			}
			
		} else {
			// ctx = this.canvas.getContext('experimental-webgl2', mParameters) || this.canvas.getContext('webgl2', mParameters);
			// if(ctx) {
			// 	this._useWebGL2 = true;
			// } else {
			// 	ctx = this.canvas.getContext('webgl', mParameters) || this.canvas.getContext('experimental-webgl', mParameters);
			// }

			ctx = this.canvas.getContext('webgl', mParameters) || this.canvas.getContext('experimental-webgl', mParameters);	
			this._useWebGL2 = false;
			
		}

		console.log('Using WebGL 2 ?', this.webgl2);

		//	extensions
		this.initWithGL(ctx);
	}

	initWithGL(ctx) {
		if(!this.canvas) {	this.canvas = ctx.canvas;	}
		gl = this.gl = ctx;

		this.extensions = {};
		for(let i = 0; i < ExtensionsList.length; i++) {
			this.extensions[ExtensionsList[i]] = gl.getExtension(ExtensionsList[i]);
		}
		
		//	Copy gl Attributes
		exposeAttributes();
		getAndApplyExtension(gl, 'OES_vertex_array_object');
		getAndApplyExtension(gl, 'ANGLE_instanced_arrays');
		getAndApplyExtension(gl, 'WEBGL_draw_buffers');
		
		this.enable(this.DEPTH_TEST);
		this.enable(this.CULL_FACE);
		this.enable(this.BLEND);
		this.enableAlphaBlending();
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


	cullFace(mValue) {
		gl.cullFace(mValue);
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
		mat4.copy(this._modelMatrix, mRotation);
		mat4.multiply(this._matrix, this.camera.matrix, this._modelMatrix);
		mat3.fromMat4(this._normalMatrix, this._matrix);
		mat3.invert(this._normalMatrix, this._normalMatrix);
		mat3.transpose(this._normalMatrix, this._normalMatrix);
		

		mat3.fromMat4(this._inverseModelViewMatrix, this._matrix);
		mat3.invert(this._inverseModelViewMatrix, this._inverseModelViewMatrix);
	}


	drawGeometry(mGeometry, modelMatrix) {
		if(mGeometry.length) {
			for(let i = 0; i < mGeometry.length; i++) {
				this.draw(mGeometry[i]);
			}
			return;
		}

		mGeometry.bind(this.shaderProgram);

		//	DEFAULT UNIFORMS
		if(this.camera !== undefined) {
			this.shader.uniform('uProjectionMatrix', 'mat4', this.camera.projection);	
			this.shader.uniform('uViewMatrix', 'mat4', this.camera.matrix);
		}
		
		this.shader.uniform('uCameraPos', 'vec3', this.camera.position);
		this.shader.uniform('uModelMatrix', 'mat4', modelMatrix || this._modelMatrix);
		this.shader.uniform('uNormalMatrix', 'mat3', this._normalMatrix);
		this.shader.uniform('uModelViewMatrixInverse', 'mat3', this._inverseModelViewMatrix);

		const drawType = mGeometry.drawType;

		if(mGeometry.isInstanced) {
			gl.drawElementsInstanced(mGeometry.drawType, mGeometry.iBuffer.numItems, gl.UNSIGNED_SHORT, 0, mGeometry.numInstance);
		} else {
			if(drawType === gl.POINTS) {
				gl.drawArrays(drawType, 0, mGeometry.vertexSize);	
			} else {
				gl.drawElements(drawType, mGeometry.iBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
			}	
		}

		mGeometry.unbind();
	}


	drawMesh(mMesh) {
		const { material, geometry } = mMesh;

		if(material.doubleSided) {
			this.disable(GL.CULL_FACE);
		} else {
			this.enable(GL.CULL_FACE);
		}

		material.update();
		this.drawGeometry(geometry, mMesh.matrix);
	}


	draw(mObj) {
		if(mObj instanceof Geometry) {
			this.drawGeometry(mObj);
		} else if(mObj instanceof Mesh) {
			this.drawMesh(mObj);
		} else if(mObj instanceof Object3D) {
			// console.log('here');
			mObj.updateMatrix();
			mObj.children.forEach(child => {
				this.draw(child);
			});
		}
	}


	drawTransformFeedback(mTransformObject) {

		const { meshSource, meshDestination, numPoints, transformFeedback } = mTransformObject;
		
		//	BIND SOURCE BUFFERS -> setupVertexAttr(sourceVAO)
		meshSource.bind(this.shaderProgram);
		meshDestination.generateBuffers(this.shaderProgram);

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

		meshSource.unbind();
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

	//	matrices

	pushMatrix() {
		const mtx = mat4.clone(this._modelMatrix);
		this._matrixStacks.push(mtx);
	}


	popMatrix() {
		if(this._matrixStacks.length == 0) {
			return null;
		}
		const mtx = this._matrixStacks.pop();
		this.rotate(mtx);
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
