// ViewBall.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewBall extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/reflection.vert'), glslify('../shaders/reflection.frag'));
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(.85, 96, true);
		console.log(alfrid.Geom.sphere);
		this.meshWire = alfrid.Geom.sphere(.85, 96, true, false, GL.LINES);
	}


	render(texture, textureLight, position, scale, axis, angle) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureLight", "uniform1i", 1);
		textureLight.bind(1);
		this.shader.uniform("position", "uniform3fv", position);
		this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);
		this.shader.uniform("axis", "uniform3fv", axis);
		this.shader.uniform("angle", "uniform1f", angle);
		this.shader.uniform("showWires", "uniform1f", params.wires ? 1.0 : 0.0);
		GL.draw(params.showWires ? this.meshWire : this.mesh);
	}


}

export default ViewBall;