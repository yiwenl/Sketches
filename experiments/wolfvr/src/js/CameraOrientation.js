// CameraOrientation.js

import alfrid from 'alfrid';

class CameraOrientation extends alfrid.CameraPerspective {

	constructor() {
		super();
		this._quat = quat.create();
		this._orientation = mat4.create();
		this.positionOffset = [0, -3.5, 0];
	}

	setEyePostion(x, y=-2.5, z=0) {
		this.positionOffset = [x, y, z];	
		mat4.translate(this._matrix, this._orientation, this.positionOffset);
	}

	setOrientation(x, y, z, w) {
		quat.set(this._quat, x, y, z, w);
		mat4.fromQuat(this._orientation, this._quat);
		mat4.translate(this._matrix, this._orientation, this.positionOffset);
	}
}


export default CameraOrientation;