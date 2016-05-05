// ViewObjModel.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');
const RADIUS = 12;

class ViewObjModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = 0;
		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		this.position = [0, -4, 0];

		this._isOpened = false;

		this._startingPoint = [0, 5, 0];
		this._waveFront = new alfrid.EaseNumber(RADIUS, .01);
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/model.obj', (mesh)=>this._onObjLoaded(mesh), false);
	}

	_onObjLoaded(mesh) {
		this.mesh = mesh;
		// gui.add(this, 'roughness', 0, 1);
		// gui.add(this, 'specular', 0, 1);
		// gui.add(this, 'metallic', 0, 1);

		//	process
	}


	toggle(startingPoint) {
		this._isOpened = !this._isOpened;
		this._startingPoint = startingPoint;
		console.log(this._startingPoint);
		this._waveFront.value = this._isOpened ? -1 : RADIUS;
	}


	render(textureRad, textureIrr, textureColor, textureAO) {
		if(!this.mesh) {
			return;
		}

		this.time += 0.01;
		this.shader.bind();

		this.shader.uniform("uColorMap", "uniform1i", 0);
		this.shader.uniform("uAoMap", "uniform1i", 1);
		this.shader.uniform("uRadianceMap", "uniform1i", 2);
		this.shader.uniform("uIrradianceMap", "uniform1i", 3);
		textureColor.bind(0);
		textureAO.bind(1);
		textureRad.bind(2);
		textureIrr.bind(3);

		this.shader.uniform("uBaseColor", "uniform3fv", this.baseColor);
		this.shader.uniform("uRoughness", "uniform1f", this.roughness);
		this.shader.uniform("uMetallic", "uniform1f", this.metallic);
		this.shader.uniform("uSpecular", "uniform1f", this.specular);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);

		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("startingPoint", "vec3", this._startingPoint);
		this.shader.uniform("waveLength", "float", 1);
		this.shader.uniform("waveFront", "float", this._waveFront.value);
		this.shader.uniform("time", "float", this.time);

		GL.draw(this.mesh);
	}


}

export default ViewObjModel;