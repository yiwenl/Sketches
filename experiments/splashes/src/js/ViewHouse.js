// ViewHouse.js

import alfrid, { GL } from 'alfrid';

import vs from '../shaders/house.vert';
import fs from '../shaders/house.frag';
import Assets from './Assets';
import Splash from './Splash';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewHouse extends alfrid.View {
	
	constructor() {
		const _vs = vs.replace('{NUM_DROPS}', params.numDrops);
		const _fs = fs.replace('{NUM_DROPS}', params.numDrops);
		super(_vs, _fs);
	}


	_init() {
		this.mesh = Assets.get('house');
		this.mesh.generateFaces();

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		const grey = .05;
		this.baseColor = [grey, grey, grey];

		this.identityMatrix = mat4.create();
		this.drops = [];
		this._needUpdate = true;
		

		this._splashes = [];
		for(let i=0; i<params.numDrops; i++) {
			const s = new Splash();
			this._splashes.push(s);
		}


		this._textureSplash = Assets.get('splatter2');
		// this._textureSplash = Assets.get('splashes');


		this.shader.bind();
		this.shader.uniform('uAoMap', 'uniform1i', 0);

		for(let i=0; i<5; i++) {
			this.shader.uniform(`splatter${i}`, "uniform1i", i+1);
			Assets.get(`splatter${i+1}`).bind(i+1);
		}

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		

		for(let i=0; i<params.numDrops; i++) {
			this.addDrop([0.1, 2, 0.1], [0, 0, 0], 0);
		}
	}


	addDrop(pos=[0.1, 2, 0.1], target=[0, 0, 0], alpha=1) {
		let cameraDrop = new alfrid.CameraOrtho();
		let dropMatrix = mat4.create();
		const s = random(2, 3);
		cameraDrop.ortho(-s, s, s, -s, .1, 50);
		cameraDrop.lookAt(pos, target, vec3.fromValues(0, 1, 0));
		mat4.multiply(dropMatrix, cameraDrop.projection, cameraDrop.viewMatrix);

		this.drops.push(dropMatrix);
		if(this.drops.length > params.numDrops) this.drops.shift();

		const splash = this._splashes.shift();
		splash.reset();
		splash.opacity.setTo(alpha);
		this._splashes.push(splash);
		this._splashes[0].opacity.value = 0;

		this._needUpdate = true;
	}


	render(textureRad, textureIrr, textureAO) {
		this.shader.bind();

		if(this._needUpdate ) {
			let dropMatrices = [];
			
			for(let i=0; i<params.numDrops; i++) {
				let mtx = this.drops[i] || this.identityMatrix;
				for(let j=0; j<mtx.length; j++) {
					dropMatrices.push(mtx[j]);
				}

			}

			this.shader.uniform("uDropMatrices", "uniformMatrix4fv", dropMatrices);
			
			
			this._needUpdate = false;
		}

		let dropUVs = [];
		this._splashes.map((s, i)=> {
			dropUVs = dropUVs.concat(s.opacity.value);
			dropUVs = dropUVs.concat(s.textureIndex);
			return null;
		});

		this.shader.uniform("uDropUV", "vec2", dropUVs);
		this.shader.uniform("numPaints", "float", params.numPaints);
		this.shader.uniform('uRadianceMap', 'uniform1i', 6);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 7);
		textureAO.bind(0);
		textureRad.bind(6);
		textureIrr.bind(7);

		GL.draw(this.mesh);
	}


}

export default ViewHouse;