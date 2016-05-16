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

		gui.add(this, 'shadowThreshold', 0, 1);
		gui.add(this, 'shadowStrength', 0, 1);
	}


	render(textureCurr, textureNext, p, textureExtra, textureLife, textureShadow, shadowMatrix, color) {
		this.time += 0.1;

		this.shader.bind();
		textureCurr.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);
		textureLife.bind(3);

		this.shader.uniform("percent", "float", p);
		this.shader.uniform("time", "float", params.time);
		this.shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
		this.shader.uniform("uShadowThreshold", "float", this.shadowThreshold);
		this.shader.uniform("uShadowStrength", "float", this.shadowStrength);
		// const color = [params.particleColor[0]/255, params.particleColor[1]/255, params.particleColor[2]/255];
		this.shader.uniform("uBaseColor", "vec3", color);
		
		textureShadow.bind(4);
		
		GL.draw(this.mesh);
	}


}

export default ViewRender;