// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const s = Config.floorSize;
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');

		this.shader.bind();
		this.shader.uniform("color", "vec3", [216/255, 209/255, 168/255]);
		this.shader.uniform("opacity", "float", 1);
	}


	render() {
		this.shader.bind();
		
		GL.draw(this.mesh);
	}


}

export default ViewFloor;