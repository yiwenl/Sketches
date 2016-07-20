precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aExtra;
attribute vec2 aUVOffset;


uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uPositionOffset;
uniform sampler2D textureNoise;
uniform float uNumTiles;
uniform vec2 uUVOffset;
uniform vec3 uTouch;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec2 vUV;

void main(void) {
	vec2 uv       = aUVOffset / uNumTiles + uUVOffset;
	vUV           = uv;
	vec3 noise    = texture2D(textureNoise, uv).rgb;
	
	vec3 position = aVertexPosition + aPosOffset + uPositionOffset;
	// position.y    += noise.g * 5.0 - 5.0;
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
	vTextureCoord = aTextureCoord + vec2(aExtra.x, 0.0);
	vNormal       = aNormal;
}