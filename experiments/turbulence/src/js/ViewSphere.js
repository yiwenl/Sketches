// ViewSphere.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/pbr.vert';
import fs from '../shaders/pbr.frag';

class ViewSphere extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(4.2, 36);

		this.roughness = 0.05;
		this.specular = 1;
		this.metallic = 1;
		this.baseColor = [1, 1, 1];
		
		// this.radius = 4.2;
		// gui.add(this, 'radius', 1, 5);
	}


	render(textureRad, textureIrr) {
		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 0);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 1);
		textureRad.bind(0);
		textureIrr.bind(1);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewSphere;