// cubes.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtras;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vWsPosition;
varying vec4 vVsPosition;
varying float vScale;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


vec3 transform(vec3 v, float rx, float ry) {
	v.yz = rotate(v.yz, rx);
	v.xz = rotate(v.xz, ry);

	return v;
}

void main(void) {
	vScale 		  = aExtras.z;
	vec3 position = transform(aVertexPosition, aExtras.x, aExtras.y);
	position      = position * aExtras.z * uScale + aPosOffset;
	
	vWsPosition   = uModelMatrix * vec4(position, 1.0);
	vVsPosition   = uViewMatrix * vWsPosition; 
	
	gl_Position   = uProjectionMatrix * vVsPosition;
	vTextureCoord = aTextureCoord;

	vNormal       = transform(aNormal, aExtras.x, aExtras.y);
}