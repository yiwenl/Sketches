// ViewShip.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewShip extends alfrid.View {
	
	constructor() {
		// super(glslify('../shaders/ship.vert'), glslify('../shaders/ship.frag'));

		let fs = glslify('../shaders/pbr.frag');
		fs = fs.replace('{{NUM_PARTICLES}}', params.numParticles.toFixed(1));
		super(glslify('../shaders/pbr.vert'), fs);

		this.scale = 1.0;
		this.x = 0;
		this.y = 0;
		this.z = 0;
	}


	_init() {
		let loader = new alfrid.ObjLoader();
		loader.load('./assets/Rosetta.obj', (o)=>this._onObjLoaded(o), false);

		let loader0 = new alfrid.ObjLoader();
		loader0.load('./assets/Rosetta.obj', (o)=>this._onObjWireLoaded(o), false, GL.LINES);
	}


	_onObjLoaded(o) {
		if(!o.hasNormals) {
			o.computeNormals();
		}

		this.mesh = o;
	}

	_onObjWireLoaded(o) {
		console.log('here' , o);
		this.meshWire = o;
	}


	render(textureRad, textureIRR, textureAO, texturePaticles) {
		if(!this.mesh) return;
		this.shader.bind();
		this.shader.uniform("textureAO", "uniform1i", 0);
		textureAO.bind(0);
		this.shader.uniform("texturePaticles", "uniform1i", 1);
		texturePaticles.bind(1);

		this.shader.uniform("uRadianceMap", "uniform1i", 2);
		this.shader.uniform("uIrradianceMap", "uniform1i", 3);
		textureRad.bind(2);
		textureIRR.bind(3);

		let roughness4 = Math.pow(params.roughness, 4.0);
		this.shader.uniform("uBaseColor", "uniform3fv", [params.color[0]/255, params.color[1]/255, params.color[2]/255]);
		this.shader.uniform("uRoughness", "uniform1f", params.roughness);
		this.shader.uniform("uRoughness4", "uniform1f", roughness4);
		this.shader.uniform("uMetallic", "uniform1f", params.metallic);
		this.shader.uniform("uSpecular", "uniform1f", params.specular);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		this.shader.uniform("particleLightDensity", "uniform1f", params.particleLightDensity);

		this.shader.uniform("position", "uniform3fv", [this.x, this.y, this.z]);
		this.shader.uniform("scale", "uniform3fv", [this.scale, this.scale, this.scale]);

		GL.draw(params.showWires ? this.meshWire : this.mesh);
	}


}

export default ViewShip;