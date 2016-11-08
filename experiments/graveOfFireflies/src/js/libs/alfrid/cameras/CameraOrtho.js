// CameraOrtho.js

import Camera from './Camera';
import glm from 'gl-matrix';

class CameraOrtho extends Camera {
	constructor() {
		super();

		const eye    = glm.vec3.clone([0, 0, 5]);
		const center = glm.vec3.create();
		const up     = glm.vec3.clone([0, -1, 0]);
		this.lookAt(eye, center, up);
		this.ortho(1, -1, 1, -1);
	}


	setBoundary(left, right, top, bottom) {

		this.ortho(left, right, top, bottom);
		
	}


	ortho(left, right, top, bottom) {
		this.left   = left;
		this.right  = right;
		this.top    = top;
		this.bottom = bottom;
		glm.mat4.ortho(this._projection, left, right, top, bottom, 0, 10000);
	}
	
}


export default CameraOrtho;