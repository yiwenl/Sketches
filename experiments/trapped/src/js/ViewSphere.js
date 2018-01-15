// ViewSphere.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/sphere.vert';
import fs from 'shaders/sphere.frag';
import Assets from './Assets';

class ViewSphere extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		// this.mesh = alfrid.Geom.sphere(3, 48, true);
		this.mesh = Assets.get('sphere');

		console.log('mesh', this.mesh.vertices);
		const centers = [];
		for(let i=0; i<this.mesh.vertices.length; i+=3) {
			let a = this.mesh.vertices[i];
			let a = this.mesh.vertices[i];
			let a = this.mesh.vertices[i];
		}
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewSphere;