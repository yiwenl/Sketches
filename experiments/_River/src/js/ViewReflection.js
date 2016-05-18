// ViewReflection.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const fs = require('../shaders/reflection.frag')

class ViewReflection extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		const size = params.mapSize * 2.0;
		this.mesh = alfrid.Geom.plane(size, size, 1, false, 'xz');
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewReflection;