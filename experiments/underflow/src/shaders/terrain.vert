// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aPosOffset;
attribute vec2 aUVOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uNumGrid;

uniform sampler2D textureHeight;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vFinalPos;

void main(void) {

	float h = texture2D(textureHeight, aTextureCoord * uNumGrid + aUVOffset).r;
	vec3 position = aVertexPosition;
	position.xz += aPosOffset;
	position.y = h * 5.0;

	vPosition = position;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vFinalPos = gl_Position;
    vTextureCoord = aTextureCoord * uNumGrid + aUVOffset;
    vNormal = aNormal;
}