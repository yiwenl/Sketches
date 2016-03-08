// ViewHead.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewHead extends alfrid.View {
	
	constructor() {
		let fs = glslify('../shaders/pbr.frag');
		fs = fs.replace('{{NUM_PARTICLES}}', params.numParticles.toFixed(1));
		super(glslify('../shaders/pbr.vert'), fs);
		this.isReady = false;
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/004.obj', (mesh)=>this._onObjLoaded(mesh), false);
	}

	_onObjLoaded(mesh) {
		this.mesh = mesh;
		this.isReady = true;
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

		let roughness4 = Math.pow(params.roughness, 4.0);
		this.shader.uniform("uBaseColor", "uniform3fv", [1, 1, 1]);
		this.shader.uniform("uRoughness", "uniform1f", params.roughness);
		this.shader.uniform("uRoughness4", "uniform1f", roughness4);
		this.shader.uniform("uMetallic", "uniform1f", params.metallic);
		this.shader.uniform("uSpecular", "uniform1f", params.specular);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		GL.draw(this.mesh);
	}


}

export default ViewHead;