// ViewPlanes.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewPlanes extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/planes.vert'), glslify('../shaders/planes.frag'));
		this.shaderShadow = new alfrid.GLShader(glslify('../shaders/planes.vert'), glslify('../shaders/shadow.frag'));
		this._flip = 0;
		this.gamma = 2.2;
		this.exposure = 1;
		this.roughness = 0;
		this.specular = 1;
		this.metallic = 1;
	}


	_init() {
		let positions    = [];
		let normals      = [];
		let coords       = [];
		let indices      = [];
		let extras       = [];
		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy;
		
		let NUM_SLIDES   = params.numSlides;
		// const MAX_COUNT  = 15000;

		for(let j=0; j<numParticles/NUM_SLIDES; j++) {
			for(let i=0; i<numParticles/NUM_SLIDES; i++) {
				ux = i/numParticles;
				uy = j/numParticles;
				let size       = random(.03, .05);
				let ratio 	   = random(3, 5);
				let r = [random(-1, 1), random(-1, 1), random(-1, 1)];

				positions.push([0, -size, -size*ratio]);
				positions.push([0, -size,  size*ratio]);
				positions.push([0,  size,  size*ratio]);
				positions.push([0,  size, -size*ratio]);

				coords.push([ux, uy]);
				coords.push([ux, uy]);
				coords.push([ux, uy]);
				coords.push([ux, uy]);

				normals.push([1, 0, 0]);
				normals.push([1, 0, 0]);
				normals.push([1, 0, 0]);
				normals.push([1, 0, 0]);

				
				extras.push(r);
				extras.push(r);
				extras.push(r);
				extras.push(r);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);
				
				count ++;	

				positions.push([0, -size, -size]);
				positions.push([0, -size,  size]);
				positions.push([0,  size,  size]);
				positions.push([0,  size, -size]);

				coords.push([ux, uy]);
				coords.push([ux, uy]);
				coords.push([ux, uy]);
				coords.push([ux, uy]);

				normals.push([-1, 0, 0]);
				normals.push([-1, 0, 0]);
				normals.push([-1, 0, 0]);
				normals.push([-1, 0, 0]);

				extras.push(r);
				extras.push(r);
				extras.push(r);
				extras.push(r);

				indices.push(count * 4 + 3);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 0);
				
				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(extras, 'aExtra', 3);
	}


	render(texture, textureNext, percent, uvIndex, flip, shadowMatrix, textureRad, textureIrr) {
		// this._flip = this._flip == 0 ? 1 : 0;
		// let shader = shadowMapTexture === undefined ? this.shader : this.shaderShadow;
		let shader = this.shader;
		shader.bind();
		shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);
		shader.uniform("percent", "uniform1f", percent);
		shader.uniform("flip", "uniform1f", flip);
		shader.uniform("uvIndex", "uniform1f", uvIndex);
		shader.uniform("numSlides", "uniform1f", params.numSlides);
		shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);

		this.shader.uniform("uRadianceMap", "uniform1i", 2);
		this.shader.uniform("uIrradianceMap", "uniform1i", 3);
		textureRad.bind(2);
		textureIrr.bind(3);


		let roughness4 = Math.pow(this.roughness, 4.0);
		this.shader.uniform("uBaseColor", "uniform3fv", [1, 1, 1]);
		this.shader.uniform("uRoughness", "uniform1f", this.roughness);
		this.shader.uniform("uRoughness4", "uniform1f", roughness4);
		this.shader.uniform("uMetallic", "uniform1f", this.metallic);
		this.shader.uniform("uSpecular", "uniform1f", this.specular);

		this.shader.uniform("uExposure", "uniform1f", this.exposure);
		this.shader.uniform("uGamma", "uniform1f", this.gamma);

		// if(shadowMapTexture) {
		// 	shader.uniform("textureDepth", "uniform1i", 2);
		// 	shadowMapTexture.bind(2);	
		// 	shader.uniform("lightPosition", "uniform3fv", lightPosition);
		// 	shader.uniform("uShadowStrength", "uniform1f", params.shadowStrength);
		// 	shader.uniform("uShadowThreshold", "uniform1f", params.shadowThreshold);
		// }
		

		GL.draw(this.mesh);
	}


}

export default ViewPlanes;