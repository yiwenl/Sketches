// ViewFarMountains.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Params from './Params';
// import EventBus from '../../utils/EventBus';

import vs from 'shaders/background.vert';
import fs from 'shaders/background.frag';


const getTexture = function(mState) {
	switch(mState) {
		case 'day':
			return Assets.get('bgMountains');
			break;
		case 'storm':
			return Assets.get('bgMountainsStorm');
			break;
		case 'night':
			return Assets.get('bgMountainsNight');
			break;

	}
}


class ViewFarMountains extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this._offset = new alfrid.EaseNumber(1);
	}


	_init() {
		this.mesh = new alfrid.Mesh();

		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const numX = 24;
		const numY = 1;
		const radius = 60;
		const height = 30;

		const getPosition = function(i, j) {
			const a = i/numX * Math.PI * 2.0;
			const x = Math.cos(a) * radius;
			const z = Math.sin(a) * radius;
			const y = -height/2 + j/numY * height + 3;

			return [x, y, z];
		}

		for(let i=0; i<numX; i++) {
			for(let j=0; j<numY; j++) {
				positions.push(getPosition(i, j));
				positions.push(getPosition(i+1, j));
				positions.push(getPosition(i+1, j+1));
				positions.push(getPosition(i, j+1));

				uvs.push([i/numX, j/numY]);
				uvs.push([(i+1)/numX, j/numY]);
				uvs.push([(i+1)/numX, (j+1)/numY]);
				uvs.push([i/numX, (j+1)/numY]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}
		}

		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		this._curr = getTexture('day');
		this._next = getTexture('day');

		// EventBus.on('onBackgroundStateChange', (e)=> {
		// 	this._onBgChange(e.detail);
		// });
	}

	_onBgChange(o) {
		this._curr = getTexture(o.prevState);
		this._next = getTexture(o.nextState);

		this._offset.setTo(0);
		this._offset.value = 1;
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this._curr.bind(0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		this._next.bind(1);
		this.shader.uniform("uFogColor", "vec3", Params.shaderFogColor);
		this.shader.uniform("uOffset", "float", this._offset.value);
		GL.draw(this.mesh);

		GL.enable(GL.DEPTH_TEST);
	}


}

export default ViewFarMountains;