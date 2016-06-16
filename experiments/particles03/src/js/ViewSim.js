// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;
		this.speed = new alfrid.TweenNumber(1, 0.2);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);


		window.addEventListener('keydown', (e)=> {
			if(e.keyCode === 32) {
				this.toggle();
			}
		});


		gui.add(this, 'toggle');
	}

	toggle() {
		this.speed.value = this.speed.value === 1 ? 0 : 1;
	}


	render(textureVel, texturePos, textureExtra) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		this.shader.uniform('uSpeed', 'float', this.speed.value);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		GL.draw(this.mesh);
	}


}

export default ViewSim;