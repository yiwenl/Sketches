// ViewRender.js

import alfrid from 'alfrid';
const vsRender = require('../shaders/render.vert');
const fsRender = require('../shaders/render.frag');
let GL = alfrid.GL;

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vsRender, fsRender);
		this.time = Math.random() * 0xFFF;
	}


	_init() {
		let positions    = [];
		let coords       = [];
		let indices      = []; 
		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);


		this.roughness = 0.5;
		this.specular = 0.5;
		this.metallic = 1;
		this.radius = 0.03;
		let grey = 1;
		this.baseColor = [grey, grey, grey];

		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'radius', 0.01, 0.1);
		// gui.add(this, 'metallic', 0, 1);
	}


	render(textureCurr, textureNext, p, textureExtra, textureSphere, textureRad, textureIrr, textureNoise) {
		this.time += 0.1;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform("textureSphere", "uniform1i", 3);
		textureSphere.bind(3);

		this.shader.uniform("textureNoise", "uniform1i", 4);
		textureNoise.bind(4);

		this.shader.uniform('uRadianceMap', 'uniform1i', 5);
		textureRad.bind(5);

		this.shader.uniform('uIrradianceMap', 'uniform1i', 6);
		textureIrr.bind(6);


		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);

		this.shader.uniform('percent', 'float', p);
		this.shader.uniform('time', 'float', this.time);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);
		// this.shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);

		this.shader.uniform('uRadius', 'uniform1f', this.radius);
		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewRender;