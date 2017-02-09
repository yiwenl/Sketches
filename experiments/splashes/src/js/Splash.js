// Splash.js

import { EventDispatcher, EaseNumber } from 'alfrid';

class Splash extends EventDispatcher {
	constructor() {
		super();
		this.opacity = new EaseNumber(0, 0.1);
		this.reset();

	}


	reset() {
		const uvIndex = Math.floor(Math.random() * 16);
		const u = (uvIndex % 4)/4
		const v = Math.floor(uvIndex / 4) / 4;
		this.uv = [u, v];
		this.textureIndex = Math.floor(Math.random()*5);
	}
}


export default Splash;