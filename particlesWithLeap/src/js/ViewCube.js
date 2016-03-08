// ViewCube.js
import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewCube extends alfrid.View {
	constructor(position, size, color) {
		super(alfrid.ShaderLibs.generalVert, alfrid.ShaderLibs.simpleColorFrag);
		this.color = color;
		this.size = size;
		this.position = position;
		this.shaderShadow = new alfrid.GLShader(glslify('../shaders/generalShadow.vert'), glslify('../shaders/generalShadow.frag'));
	}

	_init() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);
	}

	render(shadowMatrix, lightPosition, textureDepth) {

		let shader = shadowMatrix===undefined ? this.shader : this.shaderShadow;
		// console.log('isShadow : ', shadowMatrix);
		shader.bind();
		shader.uniform("scale", "uniform3fv", this.size);
		shader.uniform("position", "uniform3fv", this.position);
		shader.uniform("color", "uniform3fv", this.color);
		shader.uniform("opacity", "uniform1f", 1);

		if(shadowMatrix) {
			shader.uniform("lightPosition", "uniform3fv", lightPosition);
			shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
			shader.uniform("textureDepth", "uniform1i", 0);
			textureDepth.bind(0);	
		}
		

		GL.draw(this.mesh);
	}
}

export default ViewCube;