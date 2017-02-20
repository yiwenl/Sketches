// ViewSky.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/sky.vert';
import fs from '../shaders/tile.frag';

class ViewSky extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(90, 24, true);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		Assets.get('bg').bind(0);
		this.shader.uniform("uUVScale", "vec2", [1, 1]);
		GL.draw(this.mesh);
	}


}

export default ViewSky;