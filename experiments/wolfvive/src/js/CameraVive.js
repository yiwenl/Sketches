// CameraVive.js

import { Camera } from 'alfrid';

class CameraVive extends Camera {
	constructor() {
		super();
	}

	updateCamera(mFrameData) {
		this._frameData = mFrameData;
	}

	setEye(mDir) {
		this._projection = this._frameData[`${mDir}ProjectionMatrix`];
		this._matrix = this._frameData[`${mDir}ViewMatrix`];
	}
}


export default CameraVive;