// ViewWolf.js

import alfrid, { GL } from 'alfrid';


import vs from '../shaders/wolf.vert';
import fs from '../shaders/wolf.frag';

const NUM_FRAMES = 16;
function getNumber(value) {
	let s = value + '';
	while(s.length<2) s = '0' + s;
	return s;
}

class ViewWolf extends alfrid.View {
	constructor() {
		super(vs, fs);
		this._frame = 0;
		this.scale = 6.0;
		this.position = [0, 2.5, -6.5];
	}


	_init() {
		this._frames = [];
		this._aos = [];

		let num;
		for(let i=0; i<NUM_FRAMES; i++) {
			num = getNumber(i+1);
			let strObj = getAsset(`objWolf${num}`);
			const m = alfrid.ObjLoader.parse(strObj);
			this._frames.push(m);
			const t = new alfrid.GLTexture(getAsset(`aoWolf${num}`));
			this._aos.push(t);
		}


		this.roughness = 1.0;
		this.specular = 0.5;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);

		this._textureWhite = alfrid.GLTexture.whiteTexture();
		const gap = 1000/40;
		setInterval(()=> {
			this._frame ++;
			if(this._frame >= NUM_FRAMES) this._frame = 0;
		}, gap);
	}


	render(textureRad, textureIrr, yOffset) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		this.aoMap.bind(0);
		// this._textureWhite.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform("uPosition", "vec3", [this.position[0], this.position[1] + yOffset, this.position[2]]);
		this.shader.uniform("uScale", "vec3", [this.scale, this.scale, this.scale]);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}

	get mesh() {	return this._frames[this._frame];	}
	get aoMap() {	return this._aos[this._frame];	}
}

export default ViewWolf;