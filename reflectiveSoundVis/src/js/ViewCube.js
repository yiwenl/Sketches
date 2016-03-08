// ViewCube.js
import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewCube extends alfrid.View {
	constructor() {
		super(glslify('../shaders/cube.vert'), glslify('../shaders/cube.frag'));
		this.time = 0;
	}

	_init() {
		let size = 1;
		this.mesh = alfrid.Geom.cube(size, size, size, true);
	}

	render(texture,scale=1) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);
		GL.draw(this.mesh);
	}
}

export default ViewCube;