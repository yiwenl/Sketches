// ParticleTexture.js

import alfrid, { GL, FrameBuffer, CameraOrtho} from 'alfrid';

import Assets from './Assets';
import Config from './Config';

import vs from 'shaders/pbr.vert';
// import fs from 'shaders/normal.frag';
import fs from 'shaders/pbr.frag';

const definesToString = function(defines) {
    let outStr = '';
    for (const def in defines) {
    	if(defines[def]) {
    		outStr += '#define ' + def + ' ' + defines[def] + '\n';	
    	}
        
    }
    return outStr;
};


class ParticleTexture extends FrameBuffer {

	constructor() {
		const defines = {
			'USE_TEX_LOD': !!GL.getExtension('EXT_shader_texture_lod') ? 1 : 0,
            'USE_IBL': 1,
            'HAS_BASECOLORMAP': 0,
            'HAS_NORMALMAP': 0,
            'HAS_EMISSIVEMAP': 0,
            'HAS_OCCLUSIONMAP': 0,
        };

		const s = 256;
		super(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		const size = 1;
		const cameraOrtho = new CameraOrtho();
		cameraOrtho.ortho(-size, size, size, -size);
		cameraOrtho.lookAt([0, 0, 3], [0, 0, 0]);
		const mesh = alfrid.Geom.sphere(1, 48);

		const defineStr = definesToString(defines);
        // console.log(defineStr);
        let _vs = `${defineStr}\n${vs}`;
        let _fs = `${defineStr}\n${fs}`;

		const shader = new alfrid.GLShader(_vs, _fs);
		this.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(cameraOrtho);
		shader.bind();

		shader.uniform("uLutMap", "uniform1i", 0);
		Assets.get('lutMap').bind(0);

		shader.uniform("uBRDFMap", "uniform1i", 1);
		Assets.get('brdfLUT').bind(1);

		shader.uniform('uIrradianceMap', 'uniform1i', 2);
		shader.uniform('uRadianceMap', 'uniform1i', 3);
		
		
		Assets.get('irr').bind(2);
		Assets.get('studio_radiance').bind(3);

		shader.uniform('uBaseColor', 'uniform3fv', [1, 1, 1]);
		shader.uniform('uRoughness', 'uniform1f', Config.roughness);
		shader.uniform('uMetallic', 'uniform1f', Config.metallic);

		//	pbr
		shader.uniform("uLightDirection", "vec3", [0, 10, 5]);
		let g = 0.5;
		shader.uniform("uLightColor", "vec3", [g, g, g]);

		let t = 0;
		shader.uniform("uScaleDiffBaseMR", "vec4", [t, t, t, t]);
		// t = -1;
		shader.uniform("uScaleFGDSpec", "vec4", [t, t, t, t]);
		t = 0.5;
		shader.uniform("uScaleIBLAmbient", "vec4", [t, t, t, t]);

		shader.uniform("uCameraPos", "vec3", [0, 0, 3]);
		shader.uniform("uOcclusionStrength", "float", 1);


		GL.draw(mesh);
		this.unbind();
	}
}

export default ParticleTexture;