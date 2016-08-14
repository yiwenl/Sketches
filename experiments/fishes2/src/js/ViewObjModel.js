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
		let strObj = getAsset('objModel');
		this.mesh = alfrid.ObjLoader.parse(strObj);

		this.roughness = 0;
		this.specular = 1;
		this.metallic = 1;
		this.baseColor = [1, 1, 1];
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

export default ViewObjModel;