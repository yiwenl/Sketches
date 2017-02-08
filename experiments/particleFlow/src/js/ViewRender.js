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

		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		const br = 0.2;
		this.baseColor = [37/255 * br, 40/255 * br, 75/255 * br];

		const f = gui.addFolder('particle');
		f.add(this, 'roughness', 0, 1);
		f.add(this, 'specular', 0, 1);
		f.add(this, 'metallic', 0, 1);
		f.open();
	}


	render(textureCurr, textureNext, p, textureExtra, textureTest, textureNormal, textureGradient, textureRad, textureIrr) {
		this.time += 0.1;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform("textureTest", "uniform1i", 3);
		textureTest.bind(3);

		this.shader.uniform("textureNormal", "uniform1i", 4);
		textureNormal.bind(4);

		this.shader.uniform("textureGradient", "uniform1i", 5);
		textureGradient.bind(5);

		this.shader.uniform('uRadianceMap', 'uniform1i', 6);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 7);
		textureRad.bind(6);
		textureIrr.bind(7);

		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('percent', 'float', p);
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform("uMaxHeight", "float", params.maxHeight);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewRender;