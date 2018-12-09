// ViewGrass.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import Assets from './Assets';
import vs from 'shaders/grass.vert';
import fs from 'shaders/grass.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewGrass extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let s = .3 * Config.grassSize;

		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;
		let m = mat4.create();

		const rotate = (v, a) => {
			let vv = vec3.clone(v);
			mat4.identity(m, m);
			mat4.rotateY(m, m, a);
			vec3.transformMat4(vv, vv, m);

			return vv;
		}


		const addPlane = (angle) => {
			positions.push(rotate([-s, 0, 0], angle));
			positions.push(rotate([ s, 0, 0], angle));
			positions.push(rotate([ s, s * 2, 0], angle));
			positions.push(rotate([-s, s * 2, 0], angle));

			uvs.push([0, 0]);
			uvs.push([1, 0]);
			uvs.push([1, 1]);
			uvs.push([0, 1]);

			indices.push(count * 4 + 0);
			indices.push(count * 4 + 1);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 0);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 3);

			count ++;
		}

		let num = 3;
		let a = Math.PI * 2 / num;

		while(num --) {
			addPlane(num * a);
		}

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		const posOffset = [];
		const extras    = [];
		let i           = Config.numGrass;
		let r           = Config.floorSize/2;
		while(i --) {
			posOffset.push([random(-r, r), Math.random(), random(-r, r)]);
			extras.push([Math.random() > .5 ? 0 : .5, Math.random() * Math.PI * 2 ])
		}

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtra');

		this.texture = Assets.get('grass');
		this.textureMap = Assets.get('totoro');
	}


	render(textureNoise, mHit) {
		GL.disable(GL.CULL_FACE);
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("textureMap", "uniform1i", 1);
		this.textureMap.bind(1);
		this.shader.uniform("textureNoise", "uniform1i", 2);
		textureNoise.bind(2);
		this.shader.uniform("uSize", "float", Config.floorSize/2);
		this.shader.uniform("uUVScale", "float", Config.uvScale);
		this.shader.uniform("uHit", "vec3", mHit);
		GL.draw(this.mesh);
		GL.enable(GL.CULL_FACE);
	}


}

export default ViewGrass;