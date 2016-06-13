// ViewDots.js

import alfrid, { GL, TweenNumber } from 'alfrid';
import vs from '../shaders/dots.vert';
import fs from '../shaders/dots.frag';


var random = function(min, max) { return min + Math.random() * (max - min);	}
const tmp = vec3.create();
const tmpDist = vec3.create();
function distance(a, b) {
	vec3.sub(tmpDist, a, b);
	return vec3.length(tmpDist);
}
const IS_MOBILE = GL.isMobile;
const NUM = IS_MOBILE ? 80 : 200;
const NUM_WAVES = IS_MOBILE ? 5 : 10;


class ViewDots extends alfrid.View {
	
	constructor() {
		let newVs = vs.replace('${NUM}', NUM_WAVES);
		super(newVs, fs);
		this.waves = [];
	}


	_init() {

		function createMesh(scale) {
			let positions = [];
			let extra = [];
			let coords = [];
			let indices = [];
			let range = 0.75;
			let count = 0;	
			const _num = NUM/scale;

			for(let j=0; j<_num; j++) {
				for(let i=0; i<_num; i++) {
					positions.push([ (i+random(-range, range)) * scale - NUM/2, Math.random(), (j+random(-range, range)) * scale - NUM/2]);
					coords.push([i/_num, j/_num]);
					indices.push(count);
					count ++;
				}
			}

			let mesh = new alfrid.Mesh(GL.POINTS);
			mesh.bufferVertex(positions);
			mesh.bufferTexCoord(coords);
			mesh.bufferIndex(indices);

			return mesh;
		}

		this.mesh = createMesh(1);
		this.meshFar = createMesh(2);
		this.meshFarest = createMesh(4);


		this.scale = 0.02 / 2;
		this.maxHeight = 1.2;
		this.noiseHeight = 1;
		// gui.add(this, 'scale', 0.01, 0.05);
		// gui.add(params, 'dotSize', 0.0005, 0.02);
		// gui.add(this, 'maxHeight', 0, 3);
		// gui.add(this, 'noiseHeight', 0, 1);


		this.near = 10.1;
		this.far = 15.1;
		// gui.add(this, 'near', 0.1, 20.2);
		// gui.add(this, 'far', 15.1, 30.3);
	}

	addWave(center) {
		let speed = random(0.01, 0.02) * .25;
		let waveFront = new TweenNumber(0, 'linear', speed);
		let waveHeight = new TweenNumber( random(0.25, 0.5) * (IS_MOBILE ? 0.5 : 1), 'sinusoidalIn');
		waveFront.value = random(10, 20);
		waveHeight.value = 0;
		let waveLength = random(.5, 1);

		const wave = {
			center,
			waveFront,
			waveHeight,
			waveLength,
		}

		this.waves.push(wave);
		if(this.waves.length > NUM_WAVES) {
			this.waves.shift();
		}
	}


	render(texture, uvOffset, num, textureNoise, cameraPosition) {
		const waveCenters = [];
		const waves = []
		let wave;
		for(let i=0; i<NUM_WAVES; i++) {
			if(this.waves[i]) {
				wave = this.waves[i];
				waveCenters.push(wave.center[0]);
				waveCenters.push(wave.center[1]);
				waveCenters.push(wave.center[2]);
				waves.push(wave.waveFront.value);
				waves.push(wave.waveHeight.value);
				waves.push(wave.waveLength);
			} else {
				waveCenters.push(0);
				waveCenters.push(0);
				waveCenters.push(0);
				waves.push(0);
				waves.push(0);
				waves.push(0);
			}
		}

		if(Math.random() > 0.99) {
			// console.log(this.waves);	
		}

		let pos = [0, 0, 0];
		let totalsize = NUM * this.scale;
		pos[0] = uvOffset[0] * NUM * num - NUM * num/2 + NUM/2;
		pos[2] = uvOffset[1] * NUM * num - NUM * num/2 + NUM/2;
		vec3.multiply(tmp, pos, [this.scale, 1, this.scale * 2]);
		let d = distance(cameraPosition, tmp);

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureNoise", "uniform1i", 1);
		textureNoise.bind(1);
		this.shader.uniform("uvOffset", "vec2", uvOffset);
		this.shader.uniform("scale", "vec3", [this.scale, 1, this.scale * 2]);
		this.shader.uniform("numSeg", "float", num);
		this.shader.uniform("uMaxHeight", "float", this.maxHeight);
		this.shader.uniform("uNoiseHeight", "float", this.noiseHeight);
		this.shader.uniform("radius", "float", params.dotSize);
		this.shader.uniform("uPosition", "vec3", pos);
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform("uInvertOffset", "float", params.invertOffset.value);

		this.shader.uniform("uWaveCenters", "vec3", waveCenters);
		this.shader.uniform("uWaves", "vec3", waves);

		if (IS_MOBILE) {
			GL.draw(this.meshFar);
		} else {
			if(d < this.near) {
				GL.draw(this.mesh);	
			} else if(d < this.far) {
				GL.draw(this.meshFar);
			} else {
				GL.draw(this.meshFarest);
			}	
		}
	}


}

export default ViewDots;