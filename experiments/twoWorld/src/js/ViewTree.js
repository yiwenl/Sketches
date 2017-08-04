// ViewTree.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from 'shaders/pbr.vert';
import fs from 'shaders/tree.frag';

class ViewTree extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('tree');
		this.texture = Assets.get('spring');
		this.textureAo = Assets.get('aoTree');
		this.baseColor = [50/255, 25/255, 25/255];
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("uAoMap", "uniform1i", 1);
		this.textureAo.bind(1);
		this.shader.uniform("uBaseColor", "uniform3fv", this.baseColor);
		GL.draw(this.mesh);
	}


}

export default ViewTree;