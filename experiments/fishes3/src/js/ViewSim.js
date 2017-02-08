// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
let fsSim = require('../shaders/flocking.frag');

const flockingParams = {
	lowThreshold:.4,
	highThreshold:.7,
	radius:1,
	repelStrength:1,
	orientStrength:1,
	attractStrength:1
}


const getUniformType = (mValue) => {
	if (!mValue.length) {
		return 'float';
	} else {
		return `vec${mValue.length}`;
	}
}


class ViewSim extends alfrid.View {
	
	constructor() {
		fsSim = fsSim.replace('{{NUM_PARTICLES}}', `${params.numParticles}.0`);
		let strUniforms = '';

		for (let s in flockingParams) {
			const uniformValue = flockingParams[s];
			const uniformType = getUniformType(uniformValue);
			const strUniform = `uniform ${uniformType} ${s};\n`
			strUniforms += strUniform;

		}

		fsSim = fsSim.replace('{{CUSTOM_UNIFORMS}}', strUniforms);

		super(alfrid.ShaderLibs.bigTriangleVert, fsSim);
		this.time = Math.random() * 0xFF;

		this._initGUI();
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
	}

	_initGUI() {
		gui.add(flockingParams, 'lowThreshold', 0, 1);
		gui.add(flockingParams, 'highThreshold', 0, 1);
		gui.add(flockingParams, 'radius', 0, 3);
		gui.add(flockingParams, 'repelStrength', 0, 2).step(0.01);
		gui.add(flockingParams, 'orientStrength', 0, 2).step(0.01);
		gui.add(flockingParams, 'attractStrength', 0, 2).step(0.01);
	}


	render(textureVel, texturePos, textureExtra) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		this._setupUniforms();


		GL.draw(this.mesh);
	}


	_setupUniforms() {

		for(let s in flockingParams) {
			const uniformType = getUniformType(flockingParams[s]);
			this.shader.uniform(s, uniformType, flockingParams[s]);
		}
	}


}

export default ViewSim;