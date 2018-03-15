// ViewPlane.js/


import alfrid, { GL } from 'alfrid';
import vs from 'shaders/plane.vert';
import fs from 'shaders/plane.frag';
import Config from './Config';

class ViewPlane extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = Config.PLANE_SIZE;
		const num = 120;
		this.mesh = alfrid.Geom.plane(s, s, num, 'xz');

		this.roughness = 0;
		this.specular = 1;
		this.metallic = 0;
		const g = 100;
		this.baseColor = [g, g, g];

		// gui.add(this, 'roughness', 0, 1);
		// gui.add(this, 'specular', 0, 1);
		// gui.add(this, 'metallic', 0, 1);
		// gui.addColor(this, 'baseColor');
	}


	render(texture, textureNormal, textureRad, textureIrr) {

		const color = this.baseColor.map( v=> v/255);

		this.shader.bind();

		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);


		this.shader.uniform('uRadianceMap', 'uniform1i', 3);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureRad.bind(3);
		textureIrr.bind(2);

		this.shader.uniform('uBaseColor', 'uniform3fv', color);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		this.shader.uniform("uCap", "float", params.cap);
		this.shader.uniform("uHeight", "float", params.height);

		GL.draw(this.mesh);
	}


}

export default ViewPlane;