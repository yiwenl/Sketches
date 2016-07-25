// save.vert

precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;
varying vec3 vColor;
varying vec3 vNormal;

void main(void) {
	vColor      = aVertexPosition;
	vec3 pos    = vec3(aTextureCoord, 0.0);
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    gl_PointSize = 1.0;
    vNormal = aNormal;
}