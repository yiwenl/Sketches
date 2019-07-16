// ViewBackground.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import vs from 'shaders/bg.vert';

class ViewBackground extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		this.texture = Assets.get(Config.image)
		this.ratio = this.texture.width / this.texture.height;


		this.mesh = alfrid.Geom.plane(this.ratio, 1, 1);

		this.resize();
		window.addEventListener('resize', ()=>this.resize());
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		if(texture) {
			texture.bind(0);
		} else {
			this.texture.bind(0);	
		}
		
		this.shader.uniform("uRatio", "float", GL.aspectRatio);
		this.shader.uniform("uScale", "float", this._scale);
		GL.draw(this.mesh);
	}


	resize() {
		
		const { width, height } = this.texture;

		const sx = window.innerWidth / width;
		const sy = window.innerHeight / height;
		this._scale = Math.max(sx, sy);
	}

}

export default ViewBackground;