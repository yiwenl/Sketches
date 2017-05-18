// getFloat.js

import GL from '../GLTool';

let hasChecked = false;
let _float;


function checkFloat() {
	if(GL.webgl2) {
		return GL.gl.FLOAT;
	} else {
		const extFloat = GL.getExtension('OES_texture_float');
		if(extFloat) {
			return GL.gl.FLOAT;
		} else {
			console.warn('USING FLOAT BUT OES_texture_float NOT SUPPORTED');
			return GL.gl.UNSIGNED_BYTE;
		}
	}

	hasChecked = true;
};

export default function () {
	if(!hasChecked) {
		_float = checkFloat();
	}


	return _float;
}