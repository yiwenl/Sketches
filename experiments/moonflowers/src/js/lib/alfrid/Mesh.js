'use strict';

import GL from './GLTool';
import { vec3 } from 'gl-matrix';
import getAttribLoc from './utils/getAttribLoc';

let gl;
const STATIC_DRAW = 35044;

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


const formBuffer = function (mData, mNum) {
	const ary = [];

	for(let i=0; i<mData.length; i+= mNum) {
		const o = [];
		for(let j=0; j<mNum; j++) {
			o.push(mData[i+j]);
		}

		ary.push(o);
	}

	return ary;
};

class Mesh {
	constructor(mDrawingType = 4, mUseVao = true) {
		gl                           = GL.gl;
		this.drawType                = mDrawingType;
		this._attributes             = [];
		this._numInstance 			 = -1;
		this._enabledVertexAttribute = [];
		
		this._indices                = [];
		this._faces                  = [];
		this._bufferChanged          = [];
		this._hasIndexBufferChanged  = false;
		this._hasVAO                 = false;
		this._isInstanced 			 = false;
		
		this._extVAO                 = !!GL.gl.createVertexArray;
		this._useVAO             	 = !!this._extVAO && mUseVao;
		// this._useVAO = false;
	}


	bufferVertex(mArrayVertices, mDrawType = STATIC_DRAW) {

		this.bufferData(mArrayVertices, 'aVertexPosition', 3, mDrawType);

		if (this.normals.length < this.vertices.length) {
			this.bufferNormal(mArrayVertices, mDrawType);	
		}

		return this;
	}


	bufferTexCoord(mArrayTexCoords, mDrawType = STATIC_DRAW) {

		this.bufferData(mArrayTexCoords, 'aTextureCoord', 2, mDrawType);
		return this;

	}


	bufferNormal(mNormals, mDrawType = STATIC_DRAW) {

		this.bufferData(mNormals, 'aNormal', 3, mDrawType);
		return this;

	}


	bufferIndex(mArrayIndices, isDynamic = false) {

		this._drawType        = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
		this._indices         = new Uint16Array(mArrayIndices);
		this._numItems 		  = this._indices.length;
		return this;

	}

	bufferFlattenData(mData, mName, mItemSize, mDrawType = STATIC_DRAW, isInstanced = false) {
		
		const data = formBuffer(mData, mItemSize);
		this.bufferData(data, mName, mItemSize, mDrawType = STATIC_DRAW, isInstanced = false);
		return this;

	}

	bufferData(mData, mName, mItemSize, mDrawType = STATIC_DRAW, isInstanced = false) {
		let i = 0;
		const drawType   = mDrawType;
		if(!drawType) debugger;

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
		const attribute = this.getAttribute(mName);

		
		if(attribute) {	
			//	attribute existed, replace with new data
			attribute.itemSize = mItemSize;
			attribute.dataArray = dataArray;
			attribute.source = mData;
		} else {
			//	attribute not exist yet, create new attribute object
			this._attributes.push({ name:mName, source:mData, itemSize: mItemSize, drawType, dataArray, isInstanced });
		}

		this._bufferChanged.push(mName);
		return this;
	}

	bufferInstance(mData, mName) {
		if (!GL.gl.vertexAttribDivisor) {
			console.error('Extension : ANGLE_instanced_arrays is not supported with this device !');
			return;
		}

		const itemSize = mData[0].length;
		this._numInstance = mData.length;
		this.bufferData(mData, mName, itemSize, STATIC_DRAW, true);
	}


	bind(mShaderProgram) {
		this.generateBuffers(mShaderProgram);

		if(this.hasVAO) {
			gl.bindVertexArray(this.vao); 
		} else {
			this.attributes.forEach((attribute)=> {
				gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
				const attrPosition = attribute.attrPosition;
				gl.vertexAttribPointer(attrPosition, attribute.itemSize, gl.FLOAT, false, 0, 0);

				if(attribute.isInstanced) {
					gl.vertexAttribDivisor(attrPosition, 1);
				}

			});

			//	BIND INDEX BUFFER
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);	
		}
	}

	generateBuffers(mShaderProgram) {
		if(this._bufferChanged.length == 0) { return; }

		if(this._useVAO) { //	IF SUPPORTED, CREATE VAO

			//	CREATE & BIND VAO
			if(!this._vao) {
				this._vao = gl.createVertexArray();	
			}
			
			gl.bindVertexArray(this._vao);

			//	UPDATE BUFFERS
			this._attributes.forEach((attrObj) => {

				if(this._bufferChanged.indexOf(attrObj.name) !== -1) {
					const buffer = getBuffer(attrObj);
					gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
					gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);

					const attrPosition = getAttribLoc(gl, mShaderProgram, attrObj.name);
					gl.enableVertexAttribArray(attrPosition); 
					gl.vertexAttribPointer(attrPosition, attrObj.itemSize, gl.FLOAT, false, 0, 0);
					attrObj.attrPosition = attrPosition;

					if(attrObj.isInstanced) {
						gl.vertexAttribDivisor(attrPosition, 1);
					}
				}
				
			});
				
			//	check index buffer
			this._updateIndexBuffer();

			//	UNBIND VAO
			gl.bindVertexArray(null);	
			
			this._hasVAO = true;

		} else { //	ELSE, USE TRADITIONAL METHOD

			this._attributes.forEach((attrObj) => {
				//	SKIP IF BUFFER HASN'T CHANGED
				if(this._bufferChanged.indexOf(attrObj.name) !== -1) {
					const buffer = getBuffer(attrObj);
					gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
					gl.bufferData(gl.ARRAY_BUFFER, attrObj.dataArray, attrObj.drawType);

					const attrPosition = getAttribLoc(gl, mShaderProgram, attrObj.name);
					gl.enableVertexAttribArray(attrPosition);
					gl.vertexAttribPointer(attrPosition, attrObj.itemSize, gl.FLOAT, false, 0, 0);
					attrObj.attrPosition = attrPosition;

					if(attrObj.isInstanced) {
						gl.vertexAttribDivisor(attrPosition, 1);
					}
				}
			});

			this._updateIndexBuffer();
		}

		this._hasIndexBufferChanged = false;
		this._bufferChanged = [];
	}


	unbind() {
		if(this._useVAO) {
			gl.bindVertexArray(null);	
		}
		
		this._attributes.forEach((attribute)=> {
			if(attribute.isInstanced) {
				gl.vertexAttribDivisor(attribute.attrPosition, 0);
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
		const { vertices } = this;

		for(let i = 0; i < vertices.length; i++) {

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
		const { vertices } = this;

		for(let i = 0; i < this._indices.length; i += 3) {

			ia = this._indices[i];
			ib = this._indices[i + 1];
			ic = this._indices[i + 2];

			a = vertices[ia];
			b = vertices[ib];
			c = vertices[ic];

			const face = {
				indices:[ia, ib, ic],
				vertices:[a, b, c],
			};

			this._faces.push(face);
		}

	}


	getAttribute(mName) {	return this._attributes.find((a) => a.name === mName);	}
	getSource(mName) {
		const attr = this.getAttribute(mName);
		return attr ? attr.source : [];
	}


	//	GETTER AND SETTERS

	get vertices() {	return this.getSource('aVertexPosition');	}

	get normals() {		return this.getSource('aNormal');	}

	get coords() {		return this.getSource('aTextureCoord');	}

	get indices() {		return this._indices;	}

	get vertexSize() {	return this.vertices.length;	}

	get faces() {	return this._faces;	}

	get attributes() {	return this._attributes;	}

	get hasVAO() {	return this._hasVAO;	}

	get vao() {	return this._vao;	}

	get numInstance() {	return this._numInstance;	}

	get isInstanced() { return this._isInstanced;	}

}


export default Mesh;