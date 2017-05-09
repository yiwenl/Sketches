// ViewReflection.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/reflection.vert';
import fs from 'shaders/reflection.frag';

class ViewReflection extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 24);

		// 
		this.mip = 1.0;
		this.noiseScale = 1.0;
		this.angle = 0.2;
		gui.add(this, 'mip', 0.0, 6.0);
		gui.add(this, 'noiseScale', 0.0, 6.0);
		gui.add(this, 'angle', 0.0, Math.PI);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uMip", "float", this.mip);
		this.shader.uniform("uNoiseScale", "float", this.noiseScale);
		this.shader.uniform("uAngle", "float", this.angle);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewReflection;