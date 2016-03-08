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
		this.meshWire = alfrid.Geom.sphere(10, 96, false, true, GL.LINES);
	}


	render(beatValue) {
		this.time += .01 + beatValue * .1;
		this.shader.bind();
		this.shader.uniform("time", "uniform1f", this.time);
		this.shader.uniform("showWires", "uniform1f", params.wires ? 1.0 : 0.0);
		GL.draw(params.showWires ? this.meshWire : this.mesh);
	}


}

export default ViewSphere;