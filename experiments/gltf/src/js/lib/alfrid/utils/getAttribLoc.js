// getAttribLoc.js

export default function (gl, shaderProgram, name) {
	if(shaderProgram.cacheAttribLoc === undefined) {	shaderProgram.cacheAttribLoc = {};	}
	if(shaderProgram.cacheAttribLoc[name] === undefined) {
		shaderProgram.cacheAttribLoc[name] = gl.getAttribLocation(shaderProgram, name);
	}

	return shaderProgram.cacheAttribLoc[name];
};