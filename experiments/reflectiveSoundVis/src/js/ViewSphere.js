import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewSphere extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/sphere.vert'), glslify('../shaders/sphere.frag'));
		this.time = Math.random();
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(10, 96, false, true);
	}


	render(beatValue) {
		this.time += .01 + beatValue * .1;
		this.shader.bind();
		this.shader.uniform("time", "uniform1f", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewSphere;