// ViewBalls.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/balls.vert';
import fs from 'shaders/pbr.frag';

class ViewBalls extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = .005;
		this.mesh = alfrid.Geom.sphere(s, 12);

		const max = 12000;
		this._positions = [];
		for(let i=0; i<max; i++) {
			this._positions.push([0, 0, 0]);
		}

		this._previousLength = -1;

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
	}


	render(balls, textureRad, textureIrr) {
		if(balls.length != this._previousLength) {
			balls.forEach( (p, i) => {
				this._positions[i] = p;
			});

			this.mesh.bufferInstance(this._positions, 'aPosOffset');
		}

		this._previousLength = balls.length;

		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 0);
		textureRad.bind(1);
		textureIrr.bind(0);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewBalls;