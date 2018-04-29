// ViewBubble.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/bubble.vert';
import fs from 'shaders/bubble.frag';
import Assets from './Assets';
import Config from './Config';

class ViewBubble extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = window.ARDisplay ? Config.bubbleScale : 1;
		this.mesh = alfrid.Geom.sphere(s, 24 * 4);

		this.textureReflection = Assets.get('light');
		this.textureReflection.minFilter = GL.LINEAR;
	}


	render(textureBg, mDir, mScale) {
		this.shader.bind();

		this.shader.uniform("textureBg", "uniform1i", 0);
		textureBg.bind(0);

		this.shader.uniform("textureReflection", "uniform1i", 1);
		this.textureReflection.bind(1);

		this.shader.uniform("uLookDir", "vec3", mDir);
		this.shader.uniform("uScale", "float", mScale);

		this.shader.uniform("uDimension", "vec2", [GL.width, GL.height]);
		GL.draw(this.mesh);
	}


}

export default ViewBubble;