// ViewSky.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import fs from 'shaders/sky.frag';

const getTexture = function(mState) {
	switch(mState) {
		case 'day':
			return Assets.get('bg');
			break;
		case 'storm':
			return Assets.get('bgStorm');
			break;
		case 'night':
			return Assets.get('bgNight');
			break;

	}
}


class ViewSky extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.skyboxVert, fs);
		this._offset = new alfrid.EaseNumber(1, 0.025);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(100, 16, true);

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
		this.shader.uniform("uOffset", "float", this._offset.value);
		GL.draw(this.mesh);
	}


}

export default ViewSky;