// ViewHead.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/pbr.vert';
import fs from '../shaders/pbr.frag';

class ViewHead extends alfrid.View {
	
	constructor() {
		let fsPbr = fs.replace('{{NUM_PARTICLES}}', params.numParticles.toFixed(1));
		super(vs, fsPbr);

		this.shaderWire = new alfrid.GLShader(alfrid.ShaderLibs.generalVert, alfrid.ShaderLibs.simpleColorFrag);
		this.shaderWire.bind();
		this.shaderWire.uniform("position", "uniform3fv", [0, 0, 0]);
		this.shaderWire.uniform("color", "uniform3fv", [1, 1, 1]);
		this.shaderWire.uniform("scale", "uniform3fv", [2, 2, 2]);
		this.shaderWire.uniform("opacity", "uniform1f", 1);

		this.isReady = false;
	}


	_init() {
		let strObj = getAsset('objHead');
		this.mesh = alfrid.ObjLoader.parse(strObj);
	}


	render(textureRad, textureIrr, textureAO, textureParticles) {
		if(!this.mesh) {
			return;
		}

		if(params.showWires) {
			this.shaderWire.bind();
			GL.draw(this.meshWire);
			return;
		}

		this.shader.bind();
		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("uParticlesMap", "uniform1i", 1);
		this.shader.uniform("uRadianceMap", "uniform1i", 2);
		this.shader.uniform("uIrradianceMap", "uniform1i", 3);
		textureAO.bind(0);
		textureParticles.bind(1);
		textureRad.bind(2);
		textureIrr.bind(3);

		let roughness4 = Math.pow(params.roughness, 4.0);
		this.shader.uniform("uBaseColor", "uniform3fv", [1, 1, 1]);
		this.shader.uniform("uRoughness", "uniform1f", params.roughness);
		this.shader.uniform("uRoughness4", "uniform1f", roughness4);
		this.shader.uniform("uMetallic", "uniform1f", params.metallic);
		this.shader.uniform("uSpecular", "uniform1f", params.specular);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		GL.draw(params.showWires ? this.meshWire : this.mesh);
		// GL.draw(this.mesh);
	}


}

export default ViewHead;