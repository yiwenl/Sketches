// ViewPetals.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from '../shaders/petals.vert';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewPetals extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
		this.time = Math.random() * 0xFFF;
	}


	_init() {
		this.mesh = Assets.get('petal');

		let uvs 		 = [];
		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				uvs.push([ux, uy]);

			}
		}


		this.mesh.bufferInstance(uvs, 'aUV');


		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);
	}


	render(textureCurr, textureNext, p, textureExtra) {
		GL.disable(GL.CULL_FACE);
		this.time += 0.05;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('percent', 'float', p);
		this.shader.uniform('time', 'float', this.time);

		GL.draw(this.mesh);
		GL.enable(GL.CULL_FACE);
	}


}

export default ViewPetals;