// ViewRing.js

import alfrid, { GL } from 'alfrid';
import createRingMesh from './utils/createRingMesh';
import vs from 'shaders/ring.vert';

const NUM_RINGS = 40;
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewRing extends alfrid.View {
	
	constructor() {
		super(vs);
		this.timeStart = new Date().getTime();
		this.speed = 1;
		gui.add(this, 'speed', 0, 25);
	}


	_init() {
		this.mesh = [];

		let currY = 0;
		let height, radius, theta;
		const r = .2;

		for(let i = 0; i < NUM_RINGS; i++) {

			//	get height
			height = random(.1, .2)/2;

			//	calculate the y position
			let y = currY + height/2;
			currY += height;

			//	get radius
			radius = random(2.6-r, 2.6+r);

			//	get theta
			theta = random(.5, 1);

			//	get mesh
			const mesh = createRingMesh(y, height/2, -radius, theta);

			//	add to mesh list
			this.mesh.push(mesh);
		}
	}


	render() {
		let deltaTime = new Date().getTime() - this.timeStart;
		// console.log('deltaTime', deltaTime);
		this.shader.bind();
		this.shader.uniform("uTime", "float", deltaTime/1000);
		this.shader.uniform("uSpeed", "float", this.speed);
		GL.draw(this.mesh);
	}


}

export default ViewRing;