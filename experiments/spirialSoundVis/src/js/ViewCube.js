// ViewCube.js
import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/cube.vert');
const fs = require('../shaders/cube.frag');

class ViewCube extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const size = .04;
		this.mesh = alfrid.Geom.cube(size * .35, 1, size, true);
	}


	render(radius, theta, size, lightPosition) {
		this.shader.bind();
		this.shader.uniform("size", "float", size);
		this.shader.uniform("radius", "float", radius);
		this.shader.uniform("rotation", "float", theta);
		this.shader.uniform("lightPosition", "vec3", lightPosition);
		GL.draw(this.mesh);
	}


}

export default ViewCube;