// ViewPost.js

import alfrid, { GL } from 'alfrid';

import fs from '../shaders/post.frag';

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.offset = new alfrid.EaseNumber(0);
		this._toggle = false;

		window.addEventListener('keydown', (e)=> {
			// console.log(e.keyCode);
			if(e.keyCode === 32) {
				this._toggle = !this._toggle;
				this.offset.value = this._toggle ? 1.0 : 0.0;

				document.body.classList.toggle('interacted', true);
			}
		});
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureMap) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureMap", "uniform1i", 1);
		textureMap.bind(1);
		this.shader.uniform("offset", "float", this.offset.value);
		GL.draw(this.mesh);
	}


}

export default ViewPost;