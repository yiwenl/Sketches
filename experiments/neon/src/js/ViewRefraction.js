// ViewRefraction.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/refraction.frag';

class ViewRefraction extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.strength = 0.05;
		// gui.add(this, 'strength', 0, .2);
	}


	render(texture, textureMap, textureCube) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureMap", "uniform1i", 1);
		textureMap.bind(1);
		this.shader.uniform('uCubeMap', 'uniform1i', 2);
		textureCube.bind(2);
		this.shader.uniform("uStrength", "float", this.strength);
		GL.draw(this.mesh);
	}


}

export default ViewRefraction;