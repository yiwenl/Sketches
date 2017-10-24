// ViewParticles.js


import alfrid, { GL } from 'alfrid';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';
import Scheduler from 'scheduling';

const num = 40000;
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this._scale = new alfrid.EaseNumber(0, .01);

		this.scale = 1;
	}


	_init() {
		this.mesh = new alfrid.Mesh(GL.POINTS);

		const positions = [];
		const indices = [];
		const uv = [];
		const d = .1;

		function getPos() {
			let r = random(.7, .85) * 0.8;
			let a = Math.random() * Math.PI * 2.0;


			return [
				Math.cos(a) * r,
				Math.sin(a) * r,
				random(-d, d) + 1.5,
			];

		}

		for(let i=0; i<num; i++) {
			positions.push(getPos());
			uv.push([Math.random(), Math.random()]);
			indices.push(i);
		}


		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uv);
		this.mesh.bufferIndex(indices);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uTime", "float", Scheduler.deltaTime * 0.5);
		this.shader.uniform("uScale", "float", this._scale.value);
		GL.draw(this.mesh);
	}


	set scale(mValue) {
		this._scale.value = mValue;
	}

	get scale() {
		return this._scale.value;
	}
}

export default ViewParticles;