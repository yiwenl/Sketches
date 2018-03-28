// CameraCube.js

'use strict';

import CameraPerspective from './CameraPerspective';
import { vec3 } from 'gl-matrix';

const CAMERA_SETTINGS = [
	[vec3.fromValues(0, 0, 0), vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0)],		
	[vec3.fromValues(0, 0, 0), vec3.fromValues(-1, 0, 0), vec3.fromValues(0, -1, 0)],
	[vec3.fromValues(0, 0, 0), vec3.fromValues(0,  1, 0), vec3.fromValues(0, 0,  1)],
	[vec3.fromValues(0, 0, 0), vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, -1)],
	[vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0,  1), vec3.fromValues(0, -1, 0)],
	[vec3.fromValues(0, 0, 0), vec3.fromValues(0, 0, -1), vec3.fromValues(0, -1, 0)]
];

class CameraCube extends CameraPerspective {

	constructor() {
		super();

		this.setPerspective(Math.PI / 2, 1, 0.1, 1000);
	}


	face(mIndex) {
		const o = CAMERA_SETTINGS[mIndex];
		this.lookAt(o[0], o[1], o[2]);
	}
}


export default CameraCube;