// TransformFeedbackObject.js

import GL from './GLTool';
import GLShader from './GLShader';
import Mesh from './Mesh';

let gl;

class TransformFeedbackObject {


	constructor(strVertexShader, strFragmentShader) {
		gl = GL.gl;
		this._vs = strVertexShader;
		this._fs = strFragmentShader;
		
		this._init();
	}


	_init() {
		this._meshCurrent = new Mesh();
		this._meshTarget = new Mesh();
		this._numPoints = -1;

		this._varyings = [];
		this.transformFeedback = gl.createTransformFeedback();
	}


	bufferData(mData, mName, mVaryingName) {
		const isTransformFeedback = !!mVaryingName;
		console.log('is Transform feedback ?', mName, isTransformFeedback);
		this._meshCurrent.bufferData(mData, mName, null, gl.STREAM_COPY, false);
		this._meshTarget.bufferData(mData, mName, null, gl.STREAM_COPY, false);

		if(isTransformFeedback) {
			this._varyings.push(mVaryingName);

			if(this._numPoints < 0) {
				this._numPoints = mData.length;
			}
		}
	}

	bufferIndex(mArrayIndices) {
		this._meshCurrent.bufferIndex(mArrayIndices);
		this._meshTarget.bufferIndex(mArrayIndices);
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
		const tmp          = this._meshCurrent;
		this._meshCurrent = this._meshTarget;
		this._meshTarget  = tmp;
	}

	get numPoints() {	return this._numPoints;	}
	get meshCurrent() {	return this._meshCurrent;	}
	get meshTarget() {	return this._meshTarget;	}
	get meshSource() {	return this._meshCurrent;	}
	get meshDestination() {	return this._meshTarget;	}
}


export default TransformFeedbackObject;