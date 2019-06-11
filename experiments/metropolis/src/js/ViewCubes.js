// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor(buildings) {
		super(vs, fs);


		this._buildings = buildings;
		this._initMesh();

		this.shaderFlat = new alfrid.GLShader(vs, alfrid.ShaderLibs.simpleColorFrag);
		this.shaderFlat.bind();
		this.shaderFlat.uniform("color", "vec3", [1, 0, 0]);
		this.shaderFlat.uniform("opacity", "float", 1);
	}


	_initMesh() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);

		const positions = [];
		const extras = [];
		const r = 4.0;
		this.gap = 0.4;

		this._buildings.forEach( b => { 
			positions.push([b.x, 0, b.y]);
			extras.push([b.width, b.h, b.height]);
		});


		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtra');
	}


	renderShadowMap() {
		this.shaderFlat.bind();
		this.shaderFlat.uniform("uGap", "float", this.gap * 0.9);
		GL.draw(this.mesh);
	}


	render(mtxShadow, textureDepth, lightPos) {
		this.shader.bind();
		this.shader.uniform("uGap", "float", this.gap * 0.9);

		this.shader.uniform("textureDepth", "uniform1i", 0);
		textureDepth.bind(0);
		this.shader.uniform("uMatrixShadow", "mat4", mtxShadow);
		this.shader.uniform("uLightPos", "vec3", lightPos);
		this.shader.uniform("uShadowPrec", "float", Config.shadowPrec);
		this.shader.uniform("uShadowSpread", "float", Config.shadowSpread);
		GL.draw(this.mesh);
	}


}

export default ViewCubes;