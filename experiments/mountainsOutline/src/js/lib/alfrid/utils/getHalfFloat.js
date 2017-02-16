// getHalfFloat.js

import GL from '../GLTool';

let hasChecked = false;
let halfFloat;

function checkHalfFloat() {
	if(GL.webgl2) {
		return GL.gl.HALF_FLOAT;
	} else {
		const extHalfFloat = GL.getExtension('OES_texture_half_float');
		if(extHalfFloat) {
			return extHalfFloat.HALF_FLOAT_OES;
		} else {
			console.warn('USING HALF FLOAT BUT OES_texture_half_float NOT SUPPORTED');
			return GL.gl.UNSIGNED_BYTE;
		}
	}

	hasChecked = true;
};

export default function () {
	if(!hasChecked) {
		halfFloat = checkHalfFloat();
	}

	return halfFloat;
}