// ViewSSAO.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewSSAO extends alfrid.View {
	
	constructor(mProj) {
		super(alfrid.ShaderLibs.bigTriangleVert, glslify('../shaders/ssao2.frag'));

		const n = .1;
		const f = 100;

		this.projectionParams = [f / ( f - n ), ( -f * n ) / ( f - n )];
		this.projMarixInverse = mat4.clone(mProj);

		mat4.invert(this.projMarixInverse, this.projMarixInverse);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureDepth, proj, projScale) {

		this.shader.bind();
		this.shader.uniform("time", "uniform1f", this.time);
		this.shader.uniform("resolution", "uniform2fv", [GL.width, GL.height]);
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureDepth", "uniform1i", 1);
		textureDepth.bind(1);

		this.shader.uniform("uProj", "uniform4fv", proj);
		this.shader.uniform("uProjScale", "uniform1f", projScale);
		this.shader.uniform("uProjectionParams", "uniform2fv", this.projectionParams);
		this.shader.uniform("uProjMatrixInverse", "uniformMatrix4fv", this.projMarixInverse);

		GL.draw(this.mesh);
	}


}

export default ViewSSAO;