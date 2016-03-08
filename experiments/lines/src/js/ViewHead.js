// ViewHead.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewHead extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/head.vert'), glslify('../shaders/head.frag'));
		this.isReady = false;
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/004.obj', (mesh)=>this._onObjLoaded(mesh), false);
	}

	_onObjLoaded(mesh) {
		this.mesh = mesh;
		this.isReady = true;
	}


	render(textureAO, lightPosition, exportNormal=false) {
		if(!this.mesh) {
			return;
		}

		this.shader.bind();
		this.shader.uniform("lightPosition", "uniform3fv", lightPosition);
		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("uExportNormal", "uniform1f", exportNormal ? 1 : 0);
		textureAO.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewHead;