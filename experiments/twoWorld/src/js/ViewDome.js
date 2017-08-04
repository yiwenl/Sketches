// ViewDome.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewDome extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.skyboxVert, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(45, 12, true);
		this.texture = Assets.get('spring');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewDome;