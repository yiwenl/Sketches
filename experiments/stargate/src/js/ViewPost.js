// ViewPost.js

import alfrid, { GL } from 'alfrid';
import Scheduler from 'scheduling';
import fs from 'shaders/post.frag';
import Assets from './Assets';

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		// this.textureBg = new alfrid.GLTexture(Assets.get('dungeon'));
		this.textureBg = Assets.get('reflection');

	}


	render(textureOut, textureIn, textureMap, textureNormal) {

		this.shader.bind();
		this.shader.uniform("uTime", "float", Scheduler.deltaTime * 0.05);

		this.shader.uniform("textureOut", "uniform1i", 0);
		textureOut.bind(0);

		this.shader.uniform("textureIn", "uniform1i", 1);
		textureIn.bind(1);

		this.shader.uniform("textureMap", "uniform1i", 2);
		textureMap.bind(2);

		this.shader.uniform("textureNormal", "uniform1i", 3);
		textureNormal.bind(3);

		this.shader.uniform("textureBg", "uniform1i", 4);
		this.textureBg.bind(4);

		GL.draw(this.mesh);
	}


}

export default ViewPost;