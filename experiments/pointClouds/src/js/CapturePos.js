// CapturePos.js

import alfrid from 'alfrid';

class CapturePos {
	constructor(mCameraPos, mView, mWidth=1024, mHeight=1024) {
		this._fbo = new alfrid.FrameBuffer(mWidth, mHeight, {
			type:GL.FLOAT
		});

		this.matrix = mat4.create();
	}



	get texture() {
		return this._fbo.getTexture();
	}
}

export default CapturePos;