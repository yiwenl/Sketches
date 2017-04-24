// ViewTVSimple.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from 'shaders/tele.vert';
import fs from 'shaders/teleSimple.frag';

var rand = function(min, max) { return min + Math.random() * (max - min);	}

class ViewTVSimple extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('television');


		const num = 40;
		const positions = [];
		const rotations = [];
		const extra = [];
		const maxHeight = 2;
		const maxRadius = 1.8;
		const { pow, random, cos, sin, PI } = Math;

		function getPosition() {
			let y = pow(random(), 2.0) * maxHeight;
			let r = maxRadius * (maxHeight - y) / maxHeight;
			let a = random() * PI * 2.0;
			let x = cos(a) * r;
			let z = sin(a) * r;

			return [x, y, z];
		}

		function getRotation() {
			let a = Math.PI * 0.7;

			let y = rand(2, 5);
			if(random() < .5) y *= -1;
			return [
				rand(-1, 1),
				y,
				rand(-1, 1),
				rand(-a, a)
			]
		}

		for(let i=0; i<num; i++) {
			positions.push(getPosition());
			rotations.push(getRotation());
		}

		// console.log('Mesh',this.mesh);

		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(rotations, 'aRotation');


		this.texture = Assets.get('televisions');

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
	}


	render(textureRad, textureIrr) {
		this.shader.bind();

		this.shader.uniform('uColorMap', 'uniform1i', 0);
		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		this.texture.bind(0);
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

export default ViewTVSimple;