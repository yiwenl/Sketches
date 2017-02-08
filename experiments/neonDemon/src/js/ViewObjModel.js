// ViewObjModel.js

import alfrid, { GL } from 'alfrid';
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');
const fsMap = require('../shaders/pbrMap.frag');
const fsFallback = require('../shaders/pbrFallback.frag');

class ViewObjModel extends alfrid.View {
	
	constructor() {
		let hasTextureLodSupport = GL.getExtension('EXT_shader_texture_lod') !== null;
		super(vs, hasTextureLodSupport ? fs : fsFallback);
		this.time = Math.random() * 0xFF;
		this.shaderMap = new alfrid.GLShader(vs, fsMap);
	}


	_init() {
		let strObj = getAsset('objHead');
		this.mesh = alfrid.ObjLoader.parse(strObj);

		console.log(this.mesh);

		this.roughness = .97;
		this.specular = 0;
		this.metallic = 0;
		const grey = 0.015;
		this.baseColor = [grey, grey, grey];

		this._textureNoise = new alfrid.GLTexture(getAsset('noise'));
	}


	render(textureRad, textureIrr, textureAO, textureBrush, drawingMatrix) {
		this.time += 0.01;
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform("uTextureBrush", "uniform1i", 1);
		this.shader.uniform("uTextureNoise", "uniform1i", 2);
		this.shader.uniform('uRadianceMap', 'uniform1i', 3);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 4);
		textureAO.bind(0);
		textureBrush.bind(1);
		this._textureNoise.bind(2);
		textureRad.bind(3);
		textureIrr.bind(4);

		this.shader.uniform("uDrawingMatrix", "uniformMatrix4fv", drawingMatrix);
		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform("uTime", "float", this.time);

		GL.draw(this.mesh);
	}


}

export default ViewObjModel;