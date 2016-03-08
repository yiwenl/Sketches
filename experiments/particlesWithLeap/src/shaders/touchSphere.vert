// touchSphere.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 position;
uniform vec3 scale;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	vec3 pos = aVertexPosition * scale + uNormalMatrix*position;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = uNormalMatrix * normalize(aVertexPosition);
}