// ViewRings.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/ring.vert';
import fs from 'shaders/ring.frag';

import Assets from './Assets';

class ViewRings extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this._matrix = mat4.create();
		this.position = vec3.create();
	}


	_init() {
		this.meshes = [];
		const num = 6;
		for(let i=0; i<num; i++) {
			const mesh = Assets.get(`ring0${i+1}`);

			this.meshes.push(mesh);
		}
	}


	updateMatrix(mHit) {
		mat4.identity(this._matrix);
		vec3.copy(this.position, mHit);
		const front = vec3.fromValues(0, 0, -1);
		const axis = vec3.create();
		const v = vec3.clone(mHit);
		vec3.normalize(v, v);
		vec3.cross(axis, v, front);
		vec3.normalize(axis, axis);
		let angle = vec3.dot(v, front);
		angle = Math.acos(angle);

		mat4.rotate(this._matrix, this._matrix, -angle, axis);
	}


	render() {
		this.shader.bind();

		this.shader.uniform("uLocalMatrix", "mat4", this._matrix);
		this.shader.uniform("uPosition", "vec3", this.position);
		// GL.draw(this.mesh);

		// GL.disable(GL.DEPTH_TEST);
		this.meshes.forEach( (mesh, i) => {
			this.shader.uniform("zOffset", "float", i+0.5);
			GL.draw(mesh);
		});
		// GL.enable(GL.DEPTH_TEST);
	}


}

export default ViewRings;