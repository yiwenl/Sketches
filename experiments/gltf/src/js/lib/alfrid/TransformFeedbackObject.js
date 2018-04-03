// TransformFeedbackObject.js

import GL from './GLTool';
import GLShader from './GLShader';
import Geometry from './Geometry';

let gl;

class TransformFeedbackObject {


	constructor(strVertexShader, strFragmentShader) {
		gl = GL.gl;
		this._vs = strVertexShader;
		this._fs = strFragmentShader;
		
		this._init();
	}


	_init() {
		this._geoCurrent = new Geometry();
		this._geoTarget = new Geometry();
		this._numPoints = -1;

		this._varyings = [];
		this.transformFeedback = gl.createTransformFeedback();
	}


	bufferData(mData, mName, mVaryingName) {
		const isTransformFeedback = !!mVaryingName;
		console.log('is Transform feedback ?', mName, isTransformFeedback);
		this._geoCurrent.bufferData(mData, mName, null, gl.STREAM_COPY, false);
		this._geoTarget.bufferData(mData, mName, null, gl.STREAM_COPY, false);

		if(isTransformFeedback) {
			this._varyings.push(mVaryingName);

			if(this._numPoints < 0) {
				this._numPoints = mData.length;
			}
		}
	}

	bufferIndex(mArrayIndices) {
		this._geoCurrent.bufferIndex(mArrayIndices);
		this._geoTarget.bufferIndex(mArrayIndices);
	}


	uniform(mName, mType, mValue) {
		if(this.shader) {
			this.shader.uniform(mName, mType, mValue);	
		}
		
	}

	generate() {
		this.shader = new GLShader(this._vs, this._fs, this._varyings);
	}

	render() {
		if(!this.shader) {	this.generate();	}

		this.shader.bind();
		GL.drawTransformFeedback(this);

		this._swap();
	}

	_swap() {
		const tmp          = this._geoCurrent;
		this._geoCurrent = this._geoTarget;
		this._geoTarget  = tmp;
	}

	get numPoints() {	return this._numPoints;	}
	get geoCurrent() {	return this._geoCurrent;	}
	get geoTarget() {	return this._geoTarget;	}
	get geoSource() {	return this._geoCurrent;	}
	get geoDestination() {	return this._geoTarget;	}
}


export default TransformFeedbackObject;