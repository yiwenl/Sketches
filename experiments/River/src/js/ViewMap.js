// ViewMap.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/map.vert');
const fs = require('../shaders/map.frag');

class ViewMap extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.roughness = .9;
		this.specular = 0.85;
		this.metallic = 0.85;
		this.baseColor = [1, 1, 1];
		this.scale = 1;

		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	_init() {
		this.mesh = alfrid.Geom.plane(params.mapSize, params.mapSize, 100, false, 'xz');
	}


	render(texture, textureHeight, textureRad, textureIrr, textureAO) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureHeight", "uniform1i", 1);
		textureHeight.bind(1);

		this.shader.uniform("uAoMap", "uniform1i", 2);
		this.shader.uniform("uRadianceMap", "uniform1i", 3);
		this.shader.uniform("uIrradianceMap", "uniform1i", 4);
		textureAO.bind(2);
		textureRad.bind(3);
		textureIrr.bind(4);

		this.shader.uniform("uBaseColor", "uniform3fv", this.baseColor);
		this.shader.uniform("uRoughness", "uniform1f", this.roughness);
		this.shader.uniform("uMetallic", "uniform1f", this.metallic);
		this.shader.uniform("uSpecular", "uniform1f", this.specular);

		this.shader.uniform("uPosition", "vec3", [0, params.mapY, 0]);
		this.shader.uniform("uScale", "vec3", [this.scale, this.scale, this.scale]);
		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewMap;