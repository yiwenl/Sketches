// ViewGiant.js

import alfrid, { GL } from 'alfrid';
const vs = require('../shaders/basic.vert');
const fs = require('../shaders/giant.frag');

class ViewGiant extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.position = [-7, 0.0, -8];
		this.scale = 1;
		this.rotation = Math.PI;
	}


	_init() {
		// this.mesh;
		const loader = new alfrid.ObjLoader();
		loader.load('assets/giant.obj', (e)=>this._onObjLoaded(e), false);
	}


	_onObjLoaded(mesh) {
		console.log('obj loaded : ', mesh);
		this.mesh = mesh;
	}


	render(texture, isFlipping=false) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("position", "vec3", this.position);
		this.shader.uniform("scale", "vec3", [this.scale, this.scale, this.scale]);
		this.shader.uniform("uFlip", "float", isFlipping ? -1.0 : 1.0);
		this.shader.uniform("uRotation", "float", this.rotation);
		this.shader.uniform("uGlobalTime", "float", params.globalTime);
		GL.draw(this.mesh);
	}


}

export default ViewGiant;