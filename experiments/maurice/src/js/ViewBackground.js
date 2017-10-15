// ViewBackground.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/bg.vert';
import fs from 'shaders/bg.frag';

class ViewBackground extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.position = [0, 0, 0];
		this.scale = [1, 1, 1];
		this.visible = true;
		this._opacity = new alfrid.EaseNumber(1, 1);
	}


	_init() {
		const s = 10;
		this.mesh = alfrid.Geom.plane(s, s, 1);
	}

	hide() {
		this._opacity.value = 0;
		this._opacity.easing = 1;
	}

	show() {
		this._opacity.value = 1;
		this._opacity.easing = 1;
	}


	render(mShadowMatrix, mTexture) {
		if(!this.visible) {
			return;
		}
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		mTexture.bind(0);
		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);

		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("uScale", "vec3", this.scale);
		this.shader.uniform("uOpacity", "float", this._opacity.value);
		GL.draw(this.mesh);
	}


}

export default ViewBackground;