'use strict';

import GL from './GLTool';
import glm from 'gl-matrix';

let gl;

const vec3 = glm.vec3;

const getBuffer = function (attr) {
	let buffer;
	
	if(attr.buffer !== undefined) {
		buffer = attr.buffer;	
	} else {
		buffer = gl.createBuffer();
		attr.buffer = buffer;
	}

	return buffer;
};

const getAttribLoc = function (gl, shaderProgram, name) {
	if(shaderProgram.cacheAttribLoc === undefined) {	shaderProgram.cacheAttribLoc = {};	}
	if(shaderProgram.cacheAttribLoc[name] === undefined) {
		shaderProgram.cacheAttribLoc[name] = gl.getAttribLocation(shaderProgram, name);
	}

	return shaderProgram.cacheAttribLoc[name];
};

class Mesh {
	constructor(mDrawingType = 4, mUseVao = true) {
		gl                           = GL.gl;
		this.drawType                = mDrawingType;
		this._attributes             = [];
		this._vertexSize             = 0;
		this._numInstance 			 = -1;
		this._enabledVertexAttribute = [];
		
		this._vertices               = [];
		this._texCoords              = [];
		this._normals                = [];
		this._faceNormals            = [];
		this._tangents               = [];
		this._indices                = [];
		this._faces                  = [];
		this._bufferChanged          = [];
		this._hasBufferCreated       = false;
		this._hasIndexBufferChanged  = false;
		this._hasVAO                 = false;
		this._isInstanced 			 = false;
		
		this._extVAO                 = GL.getExtension('OES_vertex_array_object');
		this._extInstance            = GL.getExtension('ANGLE_instanced_arrays');
		this._useVAO             	 = !!this._extVAO && mUseVao;

		if(GL.webgl2) {	this._useVAO = mUseVao;	}
	}


	bufferVertex(mArrayVertices, isDynamic = false) {

		this._vertexSize = mArrayVertices.length;
		this.bufferData(mArrayVertices, 'aVertexPosition', 3, isDynamic);
		this._vertices = mArrayVertices;

		if (this._normals.length < this._vertices.length) {
			this.bufferNormal(mArrayVertices, isDynamic);	
		}
	}


	bufferTexCoord(mArrayTexCoords, isDynamic = false) {

		this.bufferData(mArrayTexCoords, 'aTextureCoord', 2, isDynamic);
		this._texCoords = mArrayTexCoords;

	}


	bufferNormal(mNormals, isDynamic = false) {

		this.bufferData(mNormals, 'aNormal', 3, isDynamic);
		this._normals = mNormals;

	}


	bufferIndex(mArrayIndices, isDynamic = false) {

		this._drawType        = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
		this._indices         = new Uint16Array(mArrayIndices);
		this._numItems 		  = this._indices.length;
	}


	bufferData(mData, mName, mItemSize, isDynamic = false, isInstanced = false, isTransformFeedback = false) {
		let i = 0;
		let drawType   = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
		if(isTransformFeedback) {
			drawType = gl.STREAM_COPY;
		}

		const bufferData = [];
		if (!mItemSize) {	mItemSize = mData[0].length; }
		this._isInstanced = isInstanced || this._isInstanced;

		//	flatten buffer data		
		for(i = 0; i < mData.length; i++) {
			for(let j = 0; j < mData[i].length; j++) {
				bufferData.push(mData[i][j]);
			}
		}
		const dataArray = new Float32Array(bufferData);
		const attribute = this._attributes.find((a) => a.name === mName);

		
		if(attribute) {	
			//	attribute existed, replace with new data
			attribute.itemSize = mItemSize;
			attribute.dataArray = dataArray;
		} else {
			//	attribute not exist yet, create new attribute object
			this._attributes.push({ name:mName, itemSize: mItemSize, drawType, dataArray, isInstanced, isTransformFeedback });
		}

		this._bufferChanged.push(mName);
		this._hasBufferCreated = false;
	}



	bufferInstance(mData, mName) {
		if (!GL.webgl2 && !GL.checkExtension('ANGLE_instanced_arrays')) {
			console.warn('Extension : ANGLE_instanced_arrays is not supported with this device !');
			return;
		}

		const itemSize = mData[0].length;
		this._numInstance = mData.length;
		this.bufferData(mData, mName, itemSize, false, true);
	}


	generateBuffers(mShaderProgram) {
		if(this._hasBufferCreated) { return; }

		if(this._useVAO) { //	IF SUPPORTED, CREATE VAO

			//	CREATE & BIND VAO
			if(GL.webgl2) {
				this._vao = gl.createVertexArray();
				gl.bindVertexArray(this._vao);
			} else {
				this._vao = this._extVAO.createVertexArrayOES();
				this._extVAO.bindVertexArrayOES(this._vao);
			}


			//	UPDATE BUFFERS
			this._attributes.forEach((attrObj) => {
				// if(this._bufferChanged.indexOf(attrObj.name) === -1) {	continue; }
				const buffer = getBuffer(attrObj);

				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);

				const attrPosition = getAttribLoc(gl, mShaderProgram, attrObj.name);
				gl.enableVertexAttribArray(attrPosition);  
				gl.vertexAttribPointer(attrPosition, attrObj.itemSize, gl.FLOAT, false, 0, 0);
				attrObj.attrPosition = attrPosition;

				if(attrObj.isInstanced) {
					if(GL.webgl2) {
						gl.vertexAttribDivisor(attrPosition, 1);	
					} else {
						this._extInstance.vertexAttribDivisorANGLE(attrPosition, 1);		
					}
				}
			});
				
			//	check index buffer
			this._updateIndexBuffer();

			//	UNBIND VAO
			if(GL.webgl2) {
				gl.bindVertexArray(null);	
			} else {
				this._extVAO.bindVertexArrayOES(null);
			}
			
			this._hasVAO = true;

		} else { //	ELSE, USE TRADITIONAL METHOD

			this._attributes.forEach((attrObj) => {
				//	SKIP IF BUFFER HASN'T CHANGED
				if(this._bufferChanged.indexOf(attrObj.name) !== -1) {
					const buffer = getBuffer(attrObj);
					gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
					gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);	
				}
			});

			this._updateIndexBuffer();
		}

		this._hasIndexBufferChanged = false;
		this._hasBufferCreated = true;
		this._bufferChanged = [];
	}


	resetInstanceDivisor() {
		this._attributes.forEach((attribute)=> {
			if(attribute.isInstanced) {
				if(GL.webgl2) {
					gl.vertexAttribDivisor(attribute.attrPosition, 0);
				} else {
					this._extInstance.vertexAttribDivisorANGLE(attribute.attrPosition, 0);	
				}
			}
		});
	}

	_updateIndexBuffer() {
		if(!this._hasIndexBufferChanged) {
			if (!this.iBuffer) { this.iBuffer = gl.createBuffer();	 }
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, this._drawType);
			this.iBuffer.itemSize = 1;
			this.iBuffer.numItems = this._numItems;
		}
	}


	computeNormals(usingFaceNormals = false) {

		this.generateFaces();

		if(usingFaceNormals) {
			this._computeFaceNormals();
		} else {
			this._computeVertexNormals();
		}
	}


	computeTangents() {

	}

	//	PRIVATE METHODS

	_computeFaceNormals() {

		let faceIndex;
		let face;
		const normals = [];

		for(let i = 0; i < this._indices.length; i += 3) {
			faceIndex = i / 3;
			face = this._faces[faceIndex];
			const N = face.normal;

			normals[face.indices[0]] = N;
			normals[face.indices[1]] = N;
			normals[face.indices[2]] = N;
		}

		this.bufferNormal(normals);
	}


	_computeVertexNormals() {
		//	loop through all vertices
		let face;
		const sumNormal = vec3.create();
		const normals = [];

		for(let i = 0; i < this._vertices.length; i++) {

			vec3.set(sumNormal, 0, 0, 0);

			for(let j = 0; j < this._faces.length; j++) {
				face = this._faces[j];

				//	if vertex exist in the face, add the normal to sum normal
				if(face.indices.indexOf(i) >= 0) {

					sumNormal[0] += face.normal[0];
					sumNormal[1] += face.normal[1];
					sumNormal[2] += face.normal[2];

				}

			}

			vec3.normalize(sumNormal, sumNormal);
			normals.push([sumNormal[0], sumNormal[1], sumNormal[2]]);
		}

		this.bufferNormal(normals);

	}


	generateFaces() {
		let ia, ib, ic;
		let a, b, c;
		const vba = vec3.create(), vca = vec3.create(), vNormal = vec3.create();

		for(let i = 0; i < this._indices.length; i += 3) {

			ia = this._indices[i];
			ib = this._indices[i + 1];
			ic = this._indices[i + 2];

			a = this._vertices[ia];
			b = this._vertices[ib];
			c = this._vertices[ic];

			const face = {
				indices:[ia, ib, ic],
				vertices:[a, b, c],
			};

			this._faces.push(face);
		}

	}


	//	GETTER AND SETTERS

	get vertices() {
		return this._vertices;
	}

	get normals() {
		return this._normals;
	}

	get coords() {
		return this._texCoords;
	}

	get indices() {
		return this._indices;
	}

	get vertexSize() {
		return this._vertexSize;
	}

	get hasNormals() {
		if(this._normals.length === 0) {	return false; }
		return true;
	}

	get hasTangents() {
		if(this._tangents.length === 0) {	return false; }
		return true;	
	}

	get faces() {	return this._faces;	}

	get attributes() {	return this._attributes;	}

	get hasVAO() {	return this._hasVAO;	}

	get vao() {	return this._vao;	}

	get numInstance() {	return this._numInstance;	}

	get isInstanced() { return this._isInstanced;	}

}


export default Mesh;