// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/floor.vert';
import fs from '../shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { terrainSize } = params;
		this.mesh = alfrid.Geom.plane(terrainSize, terrainSize, 125, 'xz');

		this.baseColor = [64.0/255.0, 122.0/255.0, 42.0/255.0];
	}


	render(texture, textureNormal, uvWolf, lightIntensity) {
		const { maxHeight } = params;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("textureNormal", "uniform1i", 1);
		texture.bind(0);
		textureNormal.bind(1);
		this.shader.uniform("uMaxHeight", "float", maxHeight);

		const color = [params.grassColor[0]/255, params.grassColor[1]/255, params.grassColor[2]/255];

		// this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uBaseColor', 'uniform3fv', color);
		this.shader.uniform("uUVWolf", "vec2", uvWolf);
		this.shader.uniform("uLightIntensity", "float", lightIntensity);

		GL.draw(this.mesh);
	}


}

export default ViewFloor;