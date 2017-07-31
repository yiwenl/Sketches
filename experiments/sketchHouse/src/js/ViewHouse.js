// ViewHouse.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from 'shaders/house.vert';
import fs from 'shaders/house.frag';

import vsOutline from 'shaders/outline.vert';
import fsOutline from 'shaders/outline.frag';

class ViewHouse extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.shaderOutline = new alfrid.GLShader(vsOutline, fsOutline);
	}


	_init() {
		this.mesh = Assets.get('well');
		this.textureHatching = Assets.get('hatching');
	}


	render() {

		this.shaderOutline.bind();
		this.shaderOutline.uniform("uScale", "float", .1);
		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);


		this.shader.bind();
		this.shader.uniform("uScale", "float", .1);
		this.shader.uniform("textureHatching", "uniform1i", 0);
		this.textureHatching.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewHouse;