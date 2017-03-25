// ViewBlur.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/blur.frag';

class ViewBlur extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}

	/*
	uniform vec2 uDirection;
	uniform vec2 uResolution;
	*/
	render(texture, isVertical) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uDirection", "vec2", isVertical ? [0, 1] : [1, 0]);
		this.shader.uniform("uResolution", "vec2", [GL.width/2, GL.height/2]);
		GL.draw(this.mesh);
	}


}

export default ViewBlur;