// ViewComposeBg.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import FlowControl from './FlowControl';
import fs from 'shaders/composeBg.frag';

class ViewComposeBg extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		// console.log('FlowControl.bgOpeningOffset', FlowControl.bgOpeningOffset * 0.15 + 0.025);
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uRatio", "float", GL.aspectRatio);
		this.shader.uniform("uOpacity", "float", Config.backgroundOpacity);
		this.shader.uniform("uFadeRange", "float", Config.fadeRange);
		this.shader.uniform("uOffset", "float", FlowControl.bgOpeningOffset);

		this.shader.uniform("uRadius", "float", FlowControl.bgOpeningOffset * 0.175);
		this.shader.uniform("uDistance", "float", Config.distance);
		GL.draw(this.mesh);
	}


}

export default ViewComposeBg;