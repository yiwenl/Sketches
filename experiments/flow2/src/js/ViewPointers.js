// ViewPointers.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from 'shaders/pointerInstance.vert';
import fs from 'shaders/pointers.frag';

let hasInstancing;

class ViewPointers extends alfrid.View {
	
	constructor() {
		hasInstancing = GL.checkExtension('ANGLE_instanced_arrays');
		super(vs, fs);
	}


	_init() {
		
		console.log('Has instancing :', hasInstancing);

		if(hasInstancing) {
			this._initInstancing();
		} else {
			this._initNonInstancing();
		}
	}


	_initInstancing() {
		const numX = 40;
		const numY = 10;
		const numZ = 10;
		const dist = 2;
		let x, y, z;

		const posOffset = [];
		for(let i=0; i<numX; i++) {
			for(let j=0; j<numY; j++) {
				for(let k=0; k<numZ; k++) {
					x = (i - numX/2) * dist;
					y = (j - numY/2) * dist;
					z = (k - numZ/2) * dist;

					posOffset.push([x, y, z]);
				}
			}
		}

		this.mesh = Assets.get('pointer');;
		this.mesh.bufferInstance(posOffset, 'aPosOffset');
	}


	_initNonInstancing() {

	}


	render() {
		this.shader.bind();
		this.shader.uniform("uScale", "float", .5);
		this.shader.uniform("uTime", "float", params.time);
		this.shader.uniform("uNoiseScale", "float", params.noiseScale);
		GL.draw(this.mesh);
	}


}

export default ViewPointers;