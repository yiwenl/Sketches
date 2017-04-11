// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/cubes.vert';
import fs from '../shaders/cubes.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {

		const numCubes = 1000;
		const positions = [];
		const directions = [];
		const size = [];
		const extras = [];
		const cubeSize = .75;

		function getPosition() {
			let v =[random(-cubeSize, cubeSize), random(-cubeSize, cubeSize), random(-cubeSize, cubeSize)]; 
			let d = [0, 0, 0];

			const tmp = Math.random() * 6;

			
			if(tmp < 1) {
				v[0] = cubeSize;
				d = [1, 0, 0];
			} else if(tmp < 2) {
				v[0] = -cubeSize;
				d = [-1, 0, 0];
			} else if(tmp < 3) {
				v[1] = cubeSize;
				d = [0, 1, 0];
			} else if(tmp < 4) {
				v[1] = -cubeSize;
				d = [0, -1, 0];
			} else if(tmp < 5) {
				v[2] = cubeSize;
				d = [0, 0, 1];
			} else {
				v[2] = -cubeSize;
				d = [0, 0, -1];
			}

			return {
				v, 
				d
			};
		}


		this.mesh = alfrid.Geom.cube(1, 1, 1);

		function getScale() {
			return random(1, 3) * 0.15;
		}

		for(let i=0; i<numCubes; i++) {
			const o = getPosition();
			positions.push(o.v);
			directions.push(o.d);
			size.push([getScale(), getScale(), getScale()]);
			extras.push([Math.random(), Math.random(), Math.random()]);
		}

		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(directions, 'aDirection');
		this.mesh.bufferInstance(size, 'aSize');
		this.mesh.bufferInstance(extras, 'aExtra');


		this.roughness = 1;
		this.specular = .2;
		this.metallic = 0.7;
		const s = 0.1;
		this.baseColor = [s, s, s];

		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);

		this._force = new alfrid.EaseNumber(0, 0.05);
		this._hit;
	}


	render(textureRad, textureIrr, hit) {
		this.time += 0.01;
		if(!this._hit) {
			this._hit = vec3.clone(hit);
		} 
		
		if(hit[0] < -100) {
			this._force.value = 0.0;		
		} else {
			this._force.value = 3.0;
			this._hit = vec3.clone(hit);
		}	

		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 0);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 1);
		textureRad.bind(0);
		textureIrr.bind(1);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform("uHit", "vec3", this._hit);
		this.shader.uniform("uDrawForce", "float", this._force.value);
		this.shader.uniform("uTime", "float", this.time);

		GL.draw(this.mesh);
	}


}

export default ViewCubes;