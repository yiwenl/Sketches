// WorldGrey.js
import alfrid, { GL, GLShader } from 'alfrid';
import World from './World';
import Assets from './Assets';

import vs from 'shaders/outline.vert';
import fs from 'shaders/cel.frag';

class WorldGrey extends World {

	_init() {
		this.shaderNormal = new GLShader(null, fs);
		this.shaderNormal.bind();
		this.shaderNormal.uniform("color", "vec3", [1, 1, 1]);
		this.shaderNormal.uniform("opacity", "float", 1);


		this.shaderOutline = new GLShader(vs, alfrid.ShaderLibs.simpleColorFrag);
		this.shaderOutline.bind();
		this.shaderOutline.uniform("color", "vec3", [0, 0, 0]);
		this.shaderOutline.uniform("opacity", "float", 1);

		this.meshTerrain = Assets.get('terrain');
		this.meshTree = Assets.get('tree');
	}


	render() {
		this.shaderNormal.bind();
		GL.draw(this.meshTerrain);
		GL.draw(this.meshTree);

		this.shaderOutline.bind();
		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.meshTerrain);
		GL.draw(this.meshTree);
		GL.gl.cullFace(GL.gl.BACK);
	}
	
}


export default WorldGrey;