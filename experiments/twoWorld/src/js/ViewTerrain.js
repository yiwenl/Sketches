// ViewTerrain.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from 'shaders/terrain.vert';
import fs from 'shaders/terrain.frag';

class ViewTerrain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('terrain');
		this.texture = Assets.get('spring');
		this.textureNoise = Assets.get('noise');
		this.textureAo = Assets.get('aoTerrain');

		this.shader.bind();
		this.noiseScale = 5.0;
		this.shader.uniform("noiseScale", "float", this.noiseScale);
		this.shader.uniform("colorOffset", "float", .0);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("textureNoise", "uniform1i", 1);
		this.textureNoise.bind(1);
		this.shader.uniform("uAoMap", "uniform1i", 2);
		this.textureAo.bind(2);
		GL.draw(this.mesh);
	}


}

export default ViewTerrain;