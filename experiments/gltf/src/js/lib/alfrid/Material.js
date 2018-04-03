// Material.js

import Shaders from './shaders/Shaders';
import objectAssign from 'object-assign';

class Material {

	constructor(vs, fs, uniforms={}, defines={}) {
		this._shader = Shaders.get(vs, fs, defines);
		this.uniforms = objectAssign({}, uniforms);
	}

	update() {
		this._shader.bind();
		this._shader.uniform(this.uniforms);
	}


	get shader() {
		return this._shader;
	}
}

export default Material;