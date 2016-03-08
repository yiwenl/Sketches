// basic.vert

#define SHADER_NAME BASIC_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform float time;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
	vec3 position = aVertexPosition;
	float scale = 1.0 + sin(time) * .5;
	position *= scale;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;

    vNormal = normalize(uNormalMatrix * aNormal);
}