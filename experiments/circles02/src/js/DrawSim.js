// DrawSim.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import fs from 'shaders/sim.frag';

class DrawSim extends alfrid.Draw {
	constructor() {
		super();

		const { numParticles } = Config;
		const _fs = fs.replace('${NUM}', numParticles);

		this.useProgram(alfrid.ShaderLibs.bigTriangleVert, _fs)
			.setMesh(alfrid.Geom.bigTriangle())
	}
}

export default DrawSim;