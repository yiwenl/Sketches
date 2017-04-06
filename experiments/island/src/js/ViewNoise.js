// ViewNoise.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/noise.vert';
import fs from '../shaders/noise.frag';

const num = 200;
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewNoise extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = 0;
	}


	_init() {
		const positions = [];
		const extra = [];
		const indices = [];
		let count = 0;
		const m = mat4.create();

		function getPos() {
			let v = vec3.fromValues(0, 0, -params.sphereSize + random(.1, 1.0));
			mat4.identity(m, m);
			mat4.rotateY(m, m, Math.random() * Math.PI * 2);
			mat4.rotateX(m, m, Math.random() * Math.PI - Math.PI/2);

			vec3.transformMat4(v, v, m);
			return v;
		}

		for(let i=0; i<num; i++) {
			positions.push(getPos());
			extra.push([Math.random(), Math.random(), Math.random()]);
			indices.push(count);
			count++;
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(extra, 'aExtra');

		this.texture = Assets.get('noise');
	}


	render() {
		this.time += 0.01;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("time", "float", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;