// ViewFilmGrain.js

import alfrid, { GL } from 'alfrid';
import fsFilmGrain from 'shaders/filmGrain.frag';
import Assets from './Assets';

class ViewFilmGrain extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fsFilmGrain);
		this.time = 0;
		this.count = 0;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.time += 0.01;

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uOffset", "float", Math.random());
		Assets.get('filmGrainNoise').bind(0);

		// GL.enableAdditiveBlending();
		GL.draw(this.mesh);
		// GL.enableAlphaBlending();
	}


	getNoise() {
		return this.fboNoise.getTexture();
	}


}

export default ViewFilmGrain;