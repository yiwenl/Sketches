
import alfrid, { GL } from 'alfrid';
import Config from './Config';
import Assets from './Assets';
import FlowControl from './FlowControl';
import vs from 'shaders/trail.vert';
import fs from 'shaders/trail.frag';
import { random } from 'randomutils';

class ViewTrail extends alfrid.View {
	
	constructor() {
		const { trailLength } = Config;
		let _textureUniforms = ``;
		let _funcGetPos = ``;

		for(let i=0; i<trailLength; i++) {
			_textureUniforms += `uniform sampler2D texture${i};\n`;

			if(i < trailLength - 1) {
			_funcGetPos += `if(index < ${i}.5) {
		pos = texture2D(texture${i}, aUVOffset.xy).xyz;
	} else `
			} else {
				_funcGetPos += `{
		pos = texture2D(texture${i}, aUVOffset.xy).xyz;
	}`		
			}
		}


		let _vs = vs.replace('${TEXTURES}', _textureUniforms);
		_vs = _vs.replace('${FUN_POS}', _funcGetPos);

		super(_vs, fs);
	}


	_init() {
		const { numTrails, trailLength, numTrailSets } = Config;

		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const getPos = (i, j) => {
			// let x = i/numTrails - 0.5;
			let x = i;
			let y = j;
		}

		for(let i=0; i<trailLength-1; i++) {
			positions.push([i, -1, trailLength]);
			positions.push([i+1, -1, trailLength]);
			positions.push([i+1, 1, trailLength]);
			positions.push([i, 1, trailLength]);

			uvs.push([i/trailLength, 0]);
			uvs.push([(i+1)/trailLength, 0]);
			uvs.push([(i+1)/trailLength, 1]);
			uvs.push([i/trailLength, 1]);

			indices.push(count * 4 + 0);
			indices.push(count * 4 + 1);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 0);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 3);

			count ++;
		}


		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		const m = mat4.create();
		const { ringSize, ringRadius, zOffset } = Config;
		const getPosOrg = () => {
			let a = random(Math.PI * 2);
			let r = Math.sqrt(Math.random()) * ringSize;
			let x = Math.cos(a) * r;
			let z = Math.sin(a) * r;

			let v = vec3.fromValues(x + ringRadius, 0, z + 1.0);
			mat4.identity(m);
			a = random(Math.PI * 2);
			mat4.rotateZ(m, m, a);
			vec3.transformMat4(v, v, m);
			return v;
		}

		const uvOffset = [];
		const extra = [];
		const posOrg = [];
		let ux, uy;
		for(let j = 0; j < numTrails; j++) {
			for(let i = 0; i < numTrails; i++) {
				ux = i / numTrails;
				uy = j / numTrails;
				uvOffset.push([ux, uy, Math.random()]);
				extra.push([Math.random(), Math.random(), Math.random()]);
				posOrg.push(getPosOrg());
			}
		}


		this.mesh.bufferInstance(uvOffset, 'aUVOffset');
		this.mesh.bufferInstance(extra, 'aExtra');
		this.mesh.bufferInstance(posOrg, 'aPosOrg');

		this._length = (trailLength - 1) * numTrailSets + 1;
	}


	render(fbos, textureBg1, textureBg2) {
		const { numTrailSets, trailLength } = Config;

		GL.disable(GL.CULL_FACE);
		this.shader.bind();

		this.shader.uniform("uOpacity", "float", FlowControl.bgOpeningOffset);
		this.shader.uniform("uLength", "float", this._length);

		this.shader.uniform("textureBg1", "uniform1i", 14);
		textureBg1.bind(14);

		this.shader.uniform("textureBg2", "uniform1i", 15);
		textureBg2.bind(15);

		this.shader.uniform("uNumSeg", "float", trailLength);
		this.shader.uniform("uOffsetFadeOut", "float", Config.fadeOutOffset);

		for(let j=0; j<numTrailSets; j++) {
			this.shader.uniform("uSetIndex", "float", j);
			for(let i=0; i<trailLength; i++) {
				let textureIndex = i + j * (trailLength-1);
				this.shader.uniform(`texture${i}`, "uniform1i", i);
				fbos[textureIndex].getTexture(0).bind(i);	
			}

			GL.draw(this.mesh);	
		}

		// GL.draw(this.mesh);
		GL.enable(GL.CULL_FACE);;
	}


}

export default ViewTrail;