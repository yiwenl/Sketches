// ViewTerrain.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/terrain.frag');

class ViewTerrain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		this.position = [0, 0, 0];
		this.scale = [2, 1, 2];
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/terrain.obj', (mesh)=>this._onObjLoaded(mesh), false);
		this._textureNoise = new alfrid.GLTexture(getAsset('noise'), false, {minFilter:GL.NEAREST, magFilter:GL.NEAREST});
	}

	_onObjLoaded(mesh) {
		this.mesh = mesh;
		// gui.add(this, 'roughness', 0, 1);
		// gui.add(this, 'specular', 0, 1);
		// gui.add(this, 'metallic', 0, 1);

		this.shader.bind();

		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("texture", "uniform1i", 1);
		this.shader.uniform("textureNext", "uniform1i", 2);
		this.shader.uniform("textureNoise", "uniform1i", 3);
		this.shader.uniform("uBaseColor", "uniform3fv", this.baseColor);
		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("uScale", "vec3", this.scale);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);


		this.noiseScale = 5.0;
		// gui.add(this, 'noiseScale', 0, 10);
		this.shader.uniform("noiseScale", "float", this.noiseScale);
	}


	render(texture, textureNext, textureAO) {
		if(!this.mesh) {
			return;
		}

		this.shader.bind();
		textureAO.bind(0);
		texture.bind(1);
		textureNext.bind(2);
		this._textureNoise.bind(3);
		// this.shader.uniform("uRoughness", "uniform1f", this.roughness);
		// this.shader.uniform("uMetallic", "uniform1f", this.metallic);
		// this.shader.uniform("uSpecular", "uniform1f", this.specular);
		
		this.shader.uniform("offset", "float", params.offset);
		this.shader.uniform("colorOffset", "float", 1.0 - params.particleOpacity.value);
		

		GL.draw(this.mesh);
	}


}

export default ViewTerrain;