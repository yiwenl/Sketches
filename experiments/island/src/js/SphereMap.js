// SphereMap.js

import alfrid, { GL } from 'alfrid';

class SphereMap {
	constructor() {
		const fboMapSize = 256 * 2;
		this._fboSphere = new alfrid.FrameBuffer(fboMapSize, fboMapSize);
		// this._fboSphere = new alfrid.FrameBuffer(GL.width, GL.height);

		this._bBall = new alfrid.BatchBall();
	}


	update() {
		this._fboSphere.bind();
		GL.clear();
		const s = params.sphereSize;
		this._bBall.draw([0, 0, 0], [s, s, s], [1, 1, 1]);
		this._fboSphere.unbind();
	}


	getTexture() {
		return this._fboSphere.getTexture();
	}
}


export default SphereMap;