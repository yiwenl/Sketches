// ViewFloor.js


import alfrid from 'alfrid';
let GL = alfrid.GL;
var glslify = require("glslify");
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		console.log(alfrid.Geom.plane);
		const size = 10;
		this.mesh = alfrid.Geom.plane(size, size, 1, true, 'xz');
	}


	render(shadowMatrix, texture, light) {
		this.shader.bind();
		// this.shader.uniform("uPosition", "vec3", [0, 1, 0]);
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
		this.shader.uniform("uLight", "vec3", light);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewFloor;