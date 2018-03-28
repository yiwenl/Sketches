// ViewMicro.js

import alfrid, { GL, GLTFLoader } from 'alfrid';
import vs from 'shaders/gltf.vert';
import fs from 'shaders/gltf.frag';

import Assets from './Assets';
import Config from './Config';
import Settings from './Settings';

const definesToString = function(defines) {
	let outStr = '';
	for (const def in defines) {
		if(defines[def]) {
			outStr += '#define ' + def + ' ' + defines[def] + '\n';	
		}
		
	}
	return outStr;
};

class ViewMicro extends alfrid.View {
	
	constructor() {
		const defines = {
			'USE_IBL': 1,
			'HAS_BASECOLORMAP': 1,
			'HAS_NORMALMAP': 1,
			'HAS_EMISSIVEMAP': 0,
			'HAS_OCCLUSIONMAP': 1,
			'HAS_METALROUGHNESSMAP': 1,
		};

		const defineStr = definesToString(defines);
		const _vs = `${defineStr}\n${vs}`;
		const _fs = `${defineStr}\n${fs}`;
		super(_vs, _fs);
	}


	_init() {
		// load gltf file
		const url = 'assets/gltf/microphone.gltf';

		GLTFLoader.load(url)
		.then((gltfInfo)=> this._onLoaded(gltfInfo))
		.catch(e => {
			console.log('Error loading gltf:', e);
		});

		gui.add(Config, 'gamma', 1, 5).onChange(Settings.refresh);
		//	textures

		const textureBrdf = Assets.get('brdfLUT');
		const textureColor = Assets.get('albedo');
		const textureMetalGloss = Assets.get('metalGloss');
		const textureAO = Assets.get('ao');
		const textureNormal = Assets.get('normal');
		// textureIrr = alfrid.GLCubeTexture.parseDDS(Assets.get('plight_irradiance');
		// textureRad = alfrid.GLCubeTexture.parseDDS(Assets.get('plight_radiance');


		//	binding
		const { shader } = this;
		shader.bind();

		shader.uniform('uAoMap', 'uniform1i', 0);
		textureAO.bind(0);

		shader.uniform("uBRDFMap", "uniform1i", 1);
		textureBrdf.bind(1);

		shader.uniform("uColorMap", "uniform1i", 2);
		textureColor.bind(2);

		shader.uniform("uNormalMap", "uniform1i", 3);
		textureNormal.bind(3);

		shader.uniform("uMetallicRoughnessMap", "uniform1i", 4);
		textureMetalGloss.bind(4);

		shader.uniform('uRadianceMap', 'uniform1i', 5);
		shader.uniform('uIrradianceMap', 'uniform1i', 6);
		
		

		const baseColor = [1, 1, 1];
		const roughness = 1;
		const metallic = 1;


		shader.uniform('uBaseColor', 'uniform3fv', baseColor);
		shader.uniform('uRoughness', 'uniform1f', roughness);
		shader.uniform('uMetallic', 'uniform1f', metallic);
		shader.uniform("uNormalScale", "float", 1);
		shader.uniform("uEmissiveFactor", "vec3", [0.5, 0.5, 0.5]);

		shader.uniform("uLightDirection", "vec3", [0.5, 0.5, 0.5]);
		shader.uniform("uLightColor", "vec3", [0, 0, 0]);

		shader.uniform("uScaleDiffBaseMR", "vec4", [0, 0, 0, 0]);
		shader.uniform("uScaleFGDSpec", "vec4", [0, 0, 0, 0]);
		shader.uniform("uScaleIBLAmbient", "vec4", [1, 1, 1, 1]);

		
		shader.uniform("uOcclusionStrength", "float", 1);
	}


	_onLoaded(gltfInfo) {
		console.log('loaded :', gltfInfo);
		this.mesh = gltfInfo.output.meshes;
	}


	render(textureIrr, textureRad) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();

		this.shader.uniform("uGamma", "float", Config.gamma);
		textureRad.bind(5);
		textureIrr.bind(6);

		GL.draw(this.mesh);
	}


}

export default ViewMicro;