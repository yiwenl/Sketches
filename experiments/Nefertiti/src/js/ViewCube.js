// ViewCube.js
import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewCube extends alfrid.View {
	constructor() {
		super(alfrid.ShaderLibs.generalNormalVert, glslify('../shaders/cube.frag'));
		this.time = 0;
	}

	_init() {
		let size = 1;
		this.mesh = alfrid.Geom.cube(size, size, size, true);
	}

	render(texture) {
		this.time += .02;
		let scale = (Math.cos(this.time) * .5 + .5) * .9 + 1.0;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);
		GL.draw(this.mesh);
	}
}

export default ViewCube;