// View3D.js

import Object3D from '../objects/Object3D';
import GLShader from '../GLShader';
import GL from '../GLTool';

class View3D extends Object3D {
	constructor(mStrVertex, mStrFrag) {
		super();

		this._children = [];
		this.shader = new GLShader(mStrVertex, mStrFrag);
		this._init();
		this._matrixTemp = mat4.create();
	}


	//	PROTECTED METHODS

	_init() {

	}

	// 	PUBLIC METHODS

	addChild(mChild) {
		this._children.push(mChild);
	}

	removeChild(mChild) {
		const index = this._children.indexOf(mChild);
		if(index == -1) {	console.warn('Child no exist'); return;	}

		this._children.splice(index, 1);
	}


	toRender(matrix) {
		if(matrix === undefined) {
			matrix = mat4.create();
		}
		mat4.mul(this._matrixTemp, matrix, this.matrix);
		GL.rotate(this._matrixTemp);
		this.render();

		for(let i=0; i<this._children.length; i++) {
			const child = this._children[i];
			child.toRender(this.matrix);
		}
	}

	render() {

	}
}


export default View3D;