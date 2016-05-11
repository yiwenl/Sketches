// ViewObjModel.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');

class ViewObjModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/model.obj', (mesh)=>this._onObjLoaded(mesh), false);
	}

	_onObjLoaded(mesh) {
		this.mesh = mesh;
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(textureRad, textureIrr, textureAO) {
		if(!this.mesh) {
			return;
		}
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

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewObjModel;