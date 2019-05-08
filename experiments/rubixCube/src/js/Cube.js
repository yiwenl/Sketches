// Cube.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cube.vert';
import fs from 'shaders/cube.frag';

class Cube extends alfrid.View {
	
	constructor(mPos, mColor=[1, 1, 1]) {
		super(vs, fs);

		this._pos = vec3.clone(mPos);
		this._posCurr = vec3.clone(mPos);
		this.color = mColor;

		this._needUpdate = false;

		this._mtx = mat4.create();			//	base transform
		this._mtxCurr = mat4.create();		//	transform for animation
		this._mtxFinal = mat4.create();		//	final transform = mtx * mtxCurr
		// this._angle = new alfrid.EaseNumber(0);
		this._angle = new alfrid.TweenNumber(0, 'expInOut', 0.02);
		this._axis = vec3.create();
	}


	_init() {
		const s = 1.01;
		this.mesh = alfrid.Geom.cube(s, s, s);
	}


	rotate(mtx) {
		mat4.mul(this._mtx, mtx, this._mtx);
		this._needUpdate = true;

		this._updateMatrix();
	}


	rotateAnim(mAxis, mAngle) {
		let m = mat4.create();


		if(vec3.length(this._axis) > 0) {
			//	complete previous move
			mat4.rotate(m, m, this._angle.targetValue, this._axis);
			mat4.mul(this._mtx, m, this._mtx);
		}

		vec3.copy(this._axis, mAxis);
		this._angle.setTo(0);
		this._angle.value = mAngle;

	}


	_updateMatrix() {
		this._needUpdate = false;

		mat4.identity(this._mtxCurr, this._mtxCurr);
		mat4.rotate(this._mtxCurr, this._mtxCurr, this._angle.value, this._axis);

		mat4.mul(this._mtxFinal, this._mtxCurr, this._mtx);

		vec3.transformMat4(this._posCurr, this._pos, this._mtxFinal);
	}


	render() {
		this._updateMatrix();
		GL.rotate(this._mtxFinal);
		this.shader.bind();
		this.shader.uniform("uColor", "vec3", this.color);
		this.shader.uniform("uPos", "vec3", this._pos);

		GL.draw(this.mesh);
	}

	set speed(mValue) {
		this._angle.speed = mValue;
	}


	get position() {
		if(this._needUpdate) {
			this._updateMatrix();
		}
		return this._posCurr;
	}


}

export default Cube;