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

		this._mtx = mat4.create();
	}


	_init() {
		const s = 0.95;
		this.mesh = alfrid.Geom.cube(s, s, s);
	}


	rotate(mtx) {
		mat4.mul(this._mtx, mtx, this._mtx);
		this._needUpdate = true;

		this._updateMatrix();
	}


	_updateMatrix() {
		this._needUpdate = false;

		vec3.transformMat4(this._posCurr, this._pos, this._mtx);
	}


	render() {
		GL.rotate(this._mtx);
		this.shader.bind();
		this.shader.uniform("uColor", "vec3", this.color);
		this.shader.uniform("uPos", "vec3", this._pos);
		this.shader.uniform("uMatrix", "mat4", this._mtx);

		GL.draw(this.mesh);
	}


	get position() {
		if(this._needUpdate) {
			this._updateMatrix();
		}
		return this._posCurr;
	}


}

export default Cube;