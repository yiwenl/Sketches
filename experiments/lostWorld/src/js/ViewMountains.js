// ViewMountains.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/mountains.vert';
import fs from '../shaders/mountains.frag';


var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewMountains extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const size = 5;
		const numSeg = 20;
		const numMountains = 150;
		this.mesh = alfrid.Geom.plane(size, size, numSeg, 'xz');

		const positions = [];
		const extras = [];
		const uvs = [];
		const r = params.worldSize/2;
		const range = 10;
		const minDist = 3;

		const checkPos = function(pos) {
			let dx, dz, d;
			let hit = false;
			positions.forEach((p)=> {
				dx = p[0] - pos[0];
				dz = p[2] - pos[2];
				d = Math.sqrt(dx * dx + dz * dz);
				if(d < minDist) {
					hit = true;
					return;
				}
			});

			return hit;
		}
		

		const getPosition = function() {
			let a, x, z, _r, pos = [0, 0, 0];
			do {
				a = Math.random() * Math.PI * 2.0;
				_r = random(-range, range) + r;
				x = Math.cos(a) * _r;
				z = Math.sin(a) * _r;
				pos = [x, random(1, 2), z];
			} while(checkPos(pos));

			
			return pos;
		}

		const num = 4;
		const getUV = function() {
			let index = Math.floor(Math.random() * num * num);
			let u = (index % num) / num;
			let v = Math.floor(index / num) / num;
			return [u, v];
		}

		for(let i=0; i<numMountains; i++) {
			positions.push(getPosition());
			extras.push([Math.random() * Math.PI * 2.0, Math.random() * 0.5]);
			uvs.push(getUV());
		}


		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtras');
		this.mesh.bufferInstance(uvs, 'aUV');

		this.shader.bind();
		this.shader.uniform("uNum", "float", num);
		this.shader.uniform("textureHeight", "uniform1i", 0);
		this.shader.uniform("textureNormal", "uniform1i", 1);
		this.shader.uniform("texture", "uniform1i", 2);
		this.shader.uniform(params.fog)
	}


	render(textureHeight, textureNormal) {
		this.shader.bind();
		textureNormal.bind(1);
		textureHeight.bind(0);
		Assets.get('mountains').bind(2);

		GL.draw(this.mesh);
	}


}

export default ViewMountains;