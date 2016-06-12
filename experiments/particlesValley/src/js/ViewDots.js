// ViewDots.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/dots.vert';
import fs from '../shaders/dots.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}
const tmp = vec3.create();
const tmpDist = vec3.create();
function distance(a, b) {
	vec3.sub(tmpDist, a, b);
	return vec3.length(tmpDist);
}
const NUM = 200;

class ViewDots extends alfrid.View {
	
	constructor() {
		super(vs,  fs);
	}


	_init() {

		function createMesh(scale) {
			let positions = [];
			let extra = [];
			let coords = [];
			let indices = [];
			let range = 0.75;
			let count = 0;	
			const _num = NUM/scale;

			for(let j=0; j<_num; j++) {
				for(let i=0; i<_num; i++) {
					positions.push([ (i+random(-range, range)) * scale - NUM/2, Math.random(), (j+random(-range, range)) * scale - NUM/2]);
					coords.push([i/_num, j/_num]);
					indices.push(count);
					count ++;
				}
			}

			let mesh = new alfrid.Mesh(GL.POINTS);
			mesh.bufferVertex(positions);
			mesh.bufferTexCoord(coords);
			mesh.bufferIndex(indices);

			return mesh;
		}

		this.mesh = createMesh(1);
		this.meshFar = createMesh(2);
		this.meshFarest = createMesh(4);


		this.scale = 0.02 / 2;
		this.maxHeight = 1.2;
		this.noiseHeight = 1;
		gui.add(this, 'scale', 0.01, 0.05);
		gui.add(params, 'dotSize', 0.0005, 0.02);
		gui.add(this, 'maxHeight', 0, 3);
		gui.add(this, 'noiseHeight', 0, 1);


		this.near = 10.1;
		this.far = 15.1;
		gui.add(this, 'near', 0.1, 20.2);
		gui.add(this, 'far', 15.1, 30.3);
	}


	render(texture, uvOffset, num, textureNoise, cameraPosition) {
		let pos = [0, 0, 0];
		let totalsize = NUM * this.scale;
		pos[0] = uvOffset[0] * NUM * num - NUM * num/2 + NUM/2;
		pos[2] = uvOffset[1] * NUM * num - NUM * num/2 + NUM/2;
		vec3.multiply(tmp, pos, [this.scale, 1, this.scale * 2]);
		let d = distance(cameraPosition, tmp);

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureNoise", "uniform1i", 1);
		textureNoise.bind(1);
		this.shader.uniform("uvOffset", "vec2", uvOffset);
		this.shader.uniform("scale", "vec3", [this.scale, 1, this.scale * 2]);
		this.shader.uniform("numSeg", "float", num);
		this.shader.uniform("uMaxHeight", "float", this.maxHeight);
		this.shader.uniform("uNoiseHeight", "float", this.noiseHeight);
		this.shader.uniform("radius", "float", params.dotSize);
		this.shader.uniform("uPosition", "vec3", pos);
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);

		if(d < this.near) {
			GL.draw(this.mesh);	
		} else if(d < this.far) {
			GL.draw(this.meshFar);
		} else {
			GL.draw(this.meshFarest);
		}
		

		return {
			pos:tmp,
			dist:d,
		};
	}


}

export default ViewDots;