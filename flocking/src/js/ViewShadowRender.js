// ViewShadowRender.js
import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewShadowRender extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/shadow.vert'), glslify('../shaders/shadow.frag'));
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
	}


	render(texture, textureNext, percent, textureDepth, shadowMatrix, lightPosition) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);
		this.shader.uniform("percent", "uniform1f", percent);
		GL.draw(this.mesh);

		this.shader.uniform("lightPosition", "uniform3fv", lightPosition);
		this.shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
		this.shader.uniform("textureDepth", "uniform1i", 2);
		this.shader.uniform("uShadowStrength", "uniform1f", params.shadowStrength);
		this.shader.uniform("uShadowThreshold", "uniform1f", params.shadowThreshold);
		textureDepth.bind(2);
	}

}


export default ViewShadowRender;
