// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;


uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uMatrixShadow;
uniform float uGap;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord;

void main(void) {
	vec3 size = aExtra;
	vec3 pos = aVertexPosition * size;
	pos.y += size.y * 0.5 + 0.001;
	pos += aPosOffset;


	vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    vShadowCoord = uMatrixShadow * wsPos;
}