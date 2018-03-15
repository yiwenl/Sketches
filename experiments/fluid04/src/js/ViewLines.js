// ViewLines.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/lines.vert';
import fs from 'shaders/lines.frag';
import Config from './Config';

class ViewLines extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = new alfrid.Mesh(GL.LINES);

		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;


		const num = 100;
		let sx = -Config.PLANE_SIZE/2;
		const gap = Config.PLANE_SIZE / num;

		const getPos = (i, j) => {
			let x = sx + i * gap;
			let z = -sx - j * gap;
			return [x, 0.01, z];
		}

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
			
				positions.push(getPos(i, j));
				positions.push(getPos(i+1, j));

				uvs.push([i/num, j/num]);
				uvs.push([(i+1)/num, j/num]);

				indices.push(count);
				indices.push(count+1);

				count += 2;
			}
		}

		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);



		this.roughness = 0;
		this.specular = 1;
		this.metallic = 0;
		const g = 100;
		this.baseColor = [g, g, g];
	}


	render(texture, textureNormal, textureRad, textureIrr) {
		const color = this.baseColor.map( v=> v/255);

		this.shader.bind();

		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);

		this.shader.uniform('uRadianceMap', 'uniform1i', 3);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureRad.bind(3);
		textureIrr.bind(2);


		this.shader.uniform("uCap", "float", params.cap);
		this.shader.uniform("uHeight", "float", params.height);

		this.shader.uniform('uBaseColor', 'uniform3fv', color);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewLines;