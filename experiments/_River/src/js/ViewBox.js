// ViewBox.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');

class ViewBox extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		this.scale = 1;
	}


	_init() {
		this.height = 1.0;
		this.mesh = alfrid.Geom.cube(params.mapSize, this.height, params.mapSize, true);
	}


	render(textureRad, textureIrr, textureAO, isReflection=false) {
		this.shader.bind();

		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("uRadianceMap", "uniform1i", 1);
		this.shader.uniform("uIrradianceMap", "uniform1i", 2);
		textureAO.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		this.shader.uniform("uBaseColor", "uniform3fv", this.baseColor);
		this.shader.uniform("uRoughness", "uniform1f", this.roughness);
		this.shader.uniform("uMetallic", "uniform1f", this.metallic);
		this.shader.uniform("uSpecular", "uniform1f", this.specular);

		let y = -this.height*.5-0.001+params.mapY;
		this.shader.uniform("uPosition", "vec3", [0, y, 0]);

		let offset = isReflection ? -1.0 : 1.0;

		this.shader.uniform("uScale", "vec3", [this.scale, this.scale * offset, this.scale]);
		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewBox;