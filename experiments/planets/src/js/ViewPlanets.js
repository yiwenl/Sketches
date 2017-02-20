// ViewPlanets.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from '../shaders/planets.vert';
import fs from '../shaders/planets.frag';

class ViewPlanets extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 24);

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		this.colorCorrection = false;
		gui.add(this, 'colorCorrection');
	}


	render(textureRad, textureIrr) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		Assets.get('planet0').bind(0);

		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureRad.bind(1);
		textureIrr.bind(2);


		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		this.shader.uniform("uColorCorrection", "float", this.colorCorrection ? 1.0 : 0.0);


		GL.draw(this.mesh);
	}


}

export default ViewPlanets;