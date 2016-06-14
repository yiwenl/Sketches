// ViewSSAO.js
import alfrid, { GL } from 'alfrid';
import fs from '../shaders/ssao.frag';

class ViewSSAO extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, width=1024, height=1024) {
		this.shader.bind();
		this.shader.uniform('textureWidth', 'float', width);
		this.shader.uniform('textureHeight', 'float', height);

		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewSSAO;