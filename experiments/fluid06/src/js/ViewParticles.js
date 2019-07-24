// ViewParticles.js

import alfrid, { GL } from 'alfrid';
import ParticleTexture from './ParticleTexture';
import Config from './Config';
import getColorTheme from 'get-color-themes';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';
import fsShadow from 'shaders/shadow.frag';

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.shaderShadow = new alfrid.GLShader(vs, fsShadow);
	}


	_init() {
		const numParticles = 512;
		const s = Config.PLANE_SIZE;
		const positions = [];
		const uvs = [];
		const indices = [];
		const normals = [];

		let x, z;
		let count = 0;

		for(let i=0; i<numParticles; i++) {
			for(let j=0; j<numParticles; j++) {
				x = -s/2 + i/numParticles * s;
				z = -s/2 + j/numParticles * s;

				positions.push([x, 0, z]);
				uvs.push([i/numParticles, j/numParticles]);
				normals.push([Math.random(), Math.random(), Math.random()]);
				indices.push(count);
				count ++;
			}
		}
		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		this.textureParticle = new ParticleTexture().texture;

		this.changeColor();

		setTimeout(()=> {
			gui.add(this, 'changeColor');
			gui.add(this, 'shuffle');
		}, 500)

	}

	changeColor() {
		const colors = shuffle(getColorTheme());
		this._colors = colors;
		let c = [];
		colors.forEach( cc => {
			c = c.concat(cc);
		});
		this.shader.bind();
		this.shader.uniform("uColors", "vec3", c);
	}

	shuffle() {
		const colors = shuffle(this._colors);
		let c = [];
		colors.forEach( cc => {
			c = c.concat(cc);
		});
		this.shader.bind();
		this.shader.uniform("uColors", "vec3", c);
	}


	renderShadow(texture) {
		const shader = this.shaderShadow;
		shader.bind();
		shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		shader.uniform("textureParticle", "uniform1i", 1);
		this.textureParticle.bind(1);
		shader.uniform("uViewport", "vec2", [GL.width, GL.height]);
		shader.uniform("uHeight", "float", params.height);
		GL.draw(this.mesh);
	}


	render(texture, lightPos, mShadowMatrix, mTextureDepth) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureParticle", "uniform1i", 1);
		this.textureParticle.bind(1);
		
		this.shader.uniform("textureDepth", "uniform1i", 2);
		mTextureDepth.bind(2);

		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform("uViewport", "vec2", [GL.width, GL.height]);
		this.shader.uniform("uHeight", "float", params.height);
		this.shader.uniform("uLightPos", "vec3", lightPos);
		GL.draw(this.mesh);
	}


}

export default ViewParticles;