// ViewObjModel.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');

class ViewObjModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		
	}


	_init() {
		let strObj = getAsset('objHead');
		this.mesh = alfrid.ObjLoader.parse(strObj);

		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(textureRad, textureIrr, textureAO) {
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureAO.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewObjModel;