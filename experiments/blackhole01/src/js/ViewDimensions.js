// ViewDimensions.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import fs from 'shaders/dimension.frag';

class ViewDimensions extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.texture = Assets.get('dimension');
		this.opacity = 0.25;
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("uOpacity", "float", this.opacity);
		GL.draw(this.mesh);
	}


}

export default ViewDimensions;