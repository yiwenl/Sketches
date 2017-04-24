// ViewTelevisions.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from 'shaders/tele.vert';
import fs from 'shaders/tele.frag';

var rand = function(min, max) { return min + Math.random() * (max - min);	}

class ViewTelevisions extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('tele');


		const num = 60;
		const positions = [];
		const rotations = [];
		const extra = [];
		const maxHeight = 3;
		const maxRadius = 1;
		const { pow, random, cos, sin, PI } = Math;

		function getPosition() {
			let y = pow(random(), 1.5) * maxHeight;
			let r = maxRadius * (maxHeight - y) / maxHeight;
			let a = random() * PI * 2.0;
			let x = cos(a) * r;
			let z = sin(a) * r;

			return [x, y, z];
		}

		function getRotation() {
			let a = Math.PI;
			return [
				rand(-1, 1),
				rand(-5, 5),
				rand(-1, 1),
				rand(-a, a)
			]
		}

		for(let i=0; i<num; i++) {
			positions.push(getPosition());
			rotations.push(getRotation());
		}

		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(rotations, 'aRotation');


		this.textureColor = Assets.get('color');
		this.textureSpecular = Assets.get('specular');
		this.textureNormal = Assets.get('normal');
		this.textureMaps = Assets.get('maps');

		this.specular = 0;
	}


	render(textureRad, textureIrr, textureAO) {
		this.shader.bind();

		this.shader.uniform('uMaps', 'uniform1i', 0);
		this.shader.uniform('uColorMap', 'uniform1i', 1);
		this.shader.uniform('uNormalMap', 'uniform1i', 2);
		this.shader.uniform('uSpecularMap', 'uniform1i', 3);
		this.shader.uniform('uRadianceMap', 'uniform1i', 4);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 5);

		this.textureMaps.bind(0);
		this.textureColor.bind(1);
		this.textureNormal.bind(2);
		this.textureSpecular.bind(3);
		textureRad.bind(4);
		textureIrr.bind(5);

		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewTelevisions;