// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
		this.shader.uniform('textureOrgPos', 'uniform1i', 3);
		this.shader.uniform(params.lineLife);
		this.shader.uniform("uNumSeg", "float", params.numSeg);
		this.shader.uniform('uSphereSize', 'float', params.sphereSize);
	}


	render(textureVel, texturePos, textureExtra, textureOrgPos, hit) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureOrgPos.bind(3);

		this.shader.uniform("uHit", "vec3", hit);


		GL.draw(this.mesh);
	}


}

export default ViewSim;