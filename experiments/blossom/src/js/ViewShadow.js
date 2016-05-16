// ViewShadow.js

import alfrid, { GL }from 'alfrid';
const vsRender = require("../shaders/shadow.vert");
const fsRender = require("../shaders/shadow.frag");

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vsRender, fsRender);
	}


	_init() {
		let positions    = [];
		let coords       = [];
		let indices      = []; 
		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				ux = i/numParticles;
				uy = j/numParticles;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndices(indices);

		this.mid = .93;
		this.range = 0.05;

		this.shader.bind();
		this.shader.uniform("textureCurr", "uniform1i", 0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
		this.shader.uniform("textureLife", "uniform1i", 3);
		this.shader.uniform("textureShadow", "uniform1i", 4);

		this.shader.uniform("mid", "float", this.mid);
		this.shader.uniform("range", "float", this.range);

		this.shadowThreshold = 0.55;
		this.shadowStrength = 0.25;
		this.waveLength = .5;

		this.shader.uniform("uShadowThreshold", "float", this.shadowThreshold);
		this.shader.uniform("uShadowStrength", "float", this.shadowStrength);
	}


	render(textureCurr, textureNext, p, textureExtra, textureLife, textureShadow, shadowMatrix, color0, color1, startPoint) {
		this.time += 0.1;

		this.shader.bind();
		textureCurr.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);
		textureLife.bind(3);

		this.shader.uniform("percent", "float", p);
		this.shader.uniform("time", "float", params.time);
		this.shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
		
		// this.shader.uniform("uBaseColor", "vec3", color);
		this.shader.uniform("color0", "vec3", color0);
		this.shader.uniform("color1", "vec3", color1);
		this.shader.uniform("particleAlpha", "float", params.particleOpacity.value);
		this.shader.uniform("startPoint", "vec3", startPoint);
		this.shader.uniform("waveFront", "float", -.5 + params.offset * 3);
		this.shader.uniform("waveLength", "float", 0.5);

		
		textureShadow.bind(4);
		
		GL.draw(this.mesh);
	}


}

export default ViewRender;