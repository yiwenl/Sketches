// ViewPlane.js/


import alfrid, { GL } from 'alfrid';
import vs from 'shaders/plane.vert';
import fs from 'shaders/plane.frag';
import Config from './Config';

class ViewPlane extends alfrid.View {
	
	constructor() {
		super(vs ,fs);
	}


	_init() {
		const s = Config.PLANE_SIZE;
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewPlane;