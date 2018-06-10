// ViewObjModel.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from '../shaders/pbr.vert';
import fs from '../shaders/pbr.frag';

import Config from './Config';


const definesToString = function(defines) {
    let outStr = '';
    for (const def in defines) {
    	if(defines[def]) {
    		outStr += '#define ' + def + ' ' + defines[def] + '\n';	
    	}
        
    }
    return outStr;
};

class ViewObjModel extends alfrid.View {
	
	constructor() {
		const defines = {
            'USE_IBL': 1,
            'HAS_BASECOLORMAP': 0,
            'HAS_NORMALMAP': 0,
            'HAS_EMISSIVEMAP': 0,
            'HAS_OCCLUSIONMAP': 1,
        };
        const defineStr = definesToString(defines);
        console.log(defineStr);
        let _vs = `${defineStr}\n${vs}`;
        let _fs = `${defineStr}\n${fs}`;

		super(_vs, _fs);
	}


	_init() {
		this.mesh = Assets.get('model');

		this.roughness = 1;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(textureRad, textureIrr, textureAO) {
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		textureAO.bind(0);
		this.shader.uniform("uBRDFMap", "uniform1i", 1);
		Assets.get('brdfLUT').bind(1);

		this.shader.uniform('uRadianceMap', 'uniform1i', 3);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		
		textureRad.bind(3);
		textureIrr.bind(2);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		//	pbr
		this.shader.uniform("uLightDirection", "vec3", [0.5, 0.5, 0.5]);
		this.shader.uniform("uLightColor", "vec3", [1, 1, 1]);

		this.shader.uniform("uScaleDiffBaseMR", "vec4", [0, 0, 0, 0]);
		this.shader.uniform("uScaleFGDSpec", "vec4", [0, 0, 0, 0]);
		this.shader.uniform("uScaleIBLAmbient", "vec4", [1, 1, 1, 1]);

		this.shader.uniform("uCameraPos", "vec3", GL.camera.position);
		this.shader.uniform("uOcclusionStrength", "float", 1);

		GL.draw(this.mesh);
	}


}

export default ViewObjModel;