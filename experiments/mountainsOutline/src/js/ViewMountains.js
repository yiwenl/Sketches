// ViewMountains.js
// ViewMountains.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Params from './Params';
import randomInCircle from './RandomInCircle';
// import EventBus from '../utils/EventBus';
import vs from 'shaders/mountains.vert';
import fs from 'shaders/mountains.frag';
import fsSimple from 'shaders/mountainsSimple.frag';
import vsOutline from 'shaders/mountainsOutline.vert';
import fsOutline from 'shaders/outline.frag';

let NUM_MOUNTAINS;
const numMountainsToFade = 20;

var random = function(min, max) { return min + Math.random() * (max - min);	}
const distance = function(x1, y1, x2, y2) {
	const dx = x1 - x2;
	const dy = y1 - y2;
	return Math.sqrt(dx * dx + dy * dy);
}

class ViewMountains extends alfrid.View {
	
	constructor() {
		// super(vs, fsSimple);
		super(vs, fs);
		this.shaderOutline = new alfrid.GLShader(vsOutline, fsOutline);
		this.time = 0;
		this.walkingSpeed = new alfrid.TweenNumber(0);
		this.zOffset = 0;
		this._pivot = 0;
		this._needUpdate = true;
		
		this._bufferArray = [];
	}


	_init() {
		this._mountainHeight = [];
		const location = window.location.href;
		NUM_MOUNTAINS = Params.numMountains;
		console.log('Number of mountains : ', NUM_MOUNTAINS);

		const scale = 0.75;
		const size = 8 * scale;
		const numSeg = 40;
		this.mesh = alfrid.Geom.plane(size, size, numSeg, 'xz');

		const posOffset = [];
		const uvHeights = [];
		const extras = [];
		const uvMountains = [];


		const checkPos = function(x, z) {

			const distToCenter = distance(x, z, 0, 0);
			if(distToCenter < 8.0) {
				return false;
			}

			const minDist = 10;
			let dist;
			for(let i=0; i<posOffset.length; i++) {
				dist = distance(x, z, posOffset[i][0], posOffset[i][2]);
				if(dist < minDist) return false;
			}

			return true;

		}

		const range = 45;
		this._range = range;
		let heightIndex, uvIndex;
		let x, z;
		let o;
		let count = 0;
		for(let i=0; i<NUM_MOUNTAINS; i++) {
			count = 0;
			do {
				const o = randomInCircle(range);
				x = o.x;
				z = o.y;
			} while(!checkPos(x, z) && count++ < 500);
			
			posOffset.push([x, -0., z]);
			heightIndex = Math.floor(Math.random() * 64);
			let heights = [ (heightIndex % 8) / 8, Math.floor(heightIndex/8) / 8, random(3, 6) * scale];
			uvHeights.push(heights);
			extras.push([random(.8, 1.2), Math.random() * Math.PI * 2.0, Math.random()]);

			uvIndex = Math.floor(Math.random() * 16);
			let uvMountain = [ (uvIndex % 4)/4, Math.floor(uvIndex/4)/4, Math.random() > .5 ? 0 : 1];
			uvMountains.push(uvMountain);


			let height = new alfrid.EaseNumber(1, random(0.01, 0.03));
			this._mountainHeight.push(height);
		}


		this._posOffset = posOffset;
		this._extras = extras;

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(uvHeights, 'aHeights');
		this.mesh.bufferInstance(extras, 'aExtra');
		this.mesh.bufferInstance(uvMountains, 'aUV');

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		this._textureNoise = Assets.get('noise');
		this._texture0 = Assets.get('mountains0');
		this._texture1 = Assets.get('mountains1');


		this.shader.bind();
		
		this.shader.uniform("uFogOffset", "float", Params.fogOffset);
		this.shader.uniform("uFogDensity", "float", Params.fogDensity);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);
		this.shader.uniform('uExposure', 'uniform1f', Params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', Params.gamma);
		this.shader.uniform("uRange", "float", this._range);
		

		this.shader.uniform("textureHeight", "uniform1i", 0);
		this.shader.uniform("textureNormal", "uniform1i", 1);
		this.shader.uniform("textureNoise", "uniform1i", 2);
		this.shader.uniform("textureColor0", "uniform1i", 3);
		this.shader.uniform("textureColor1", "uniform1i", 4);
		this.shader.uniform('uRadianceMap', 'uniform1i', 5);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 6);


		// EventBus.on('mountainMove', ()=>this._startMoving());
		// EventBus.on('mountainStop', ()=>this._stopMoving());
		// EventBus.on('stateChange', (e)=>this._onStateChange(e.detail));
		// EventBus.on('mountainReset', ()=> {
		// 	this.zOffset = 0;
		// });
	}

	_onStateChange(o) {
		this._needUpdate = o.nextState <= 3;

		if(o.nextState === 1) {
			this.reset();
		}
	}


	reset() {
		this._mountainHeight
		const total = NUM_MOUNTAINS * 0.75;
		for(let i=0; i<total; i++) {
			let index = (this._pivot + i) % NUM_MOUNTAINS;
			this._mountainHeight[i].value = 0;
		}
	}


	_startMoving() {
		this.walkingSpeed.value = 0.01;
	}


	_stopMoving() {
		this.walkingSpeed.value = 0;
	}


	addMoutains(points) {
		let p;
		for(let i=0; i<points.length; i++) {
			p = points[i];

			this._pivot ++;
			if(this._pivot == Params.numMountains) {
				this._pivot = 0;
			}
			
			// this._posOffset.push([p[0], 0, p[2]]);
			this._posOffset[this._pivot] = [p[0], 0, p[2]];
			this._mountainHeight[this._pivot].value = 1;
		}

		
		for(let i=0; i<numMountainsToFade; i++) {
			let index = (this._pivot + i) % Params.numMountains;
			this._mountainHeight[index].value = 0;
		}
	}


	render(textureHeight, textureNormal, textureRad, textureIrr) {
		if(this._needUpdate) {
			this._bufferArray = this._posOffset.map((p, i)=> {
				return [p[0], this._mountainHeight[i].value, p[2]];
			});

			this.mesh.bufferInstance(this._bufferArray, 'aPosOffset');	
			this._needUpdate = false;
		}
		

		this.time += 0.01;

		this.zOffset += this.walkingSpeed.value;

		this.shader.bind();
		this.shader.uniform("uFogColor", "vec3", Params.shaderFogColor);
		this.shader.uniform("zOffset", "float", this.zOffset);
		textureHeight.bind(0);
		textureNormal.bind(1);
		this._textureNoise.bind(2);
		this._texture0.bind(3);
		this._texture1.bind(4);
		textureRad.bind(5);
		textureIrr.bind(6);

		this.shader.uniform("uTime", "float", this.time);

		GL.draw(this.mesh);

		const shader = this.shaderOutline;
		shader.bind();
		shader.uniform("textureHeight", "uniform1i", 0);
		shader.uniform("textureNormal", "uniform1i", 1);
		textureHeight.bind(0);
		textureNormal.bind(1);

		shader.uniform("uTime", "float", this.time);
		shader.uniform("uOutlineWidth", "float", Params.outlineWidth);
		shader.uniform("uOutlineNoise", "float", Params.outlineNoise);
		shader.uniform("uOutlineNoiseStrength", "float", Params.outlineNoiseStrength);

		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);
	}


}

export default ViewMountains;