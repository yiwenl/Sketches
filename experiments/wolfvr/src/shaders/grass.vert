// grass.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aColor;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uVRViewMatrix;
uniform mat4 uVRProjectionMatrix;

uniform float uMaxHeight;
uniform float uTerrainSize;
uniform sampler2D texture;
uniform sampler2D textureHeight;
uniform sampler2D textureNormal;
uniform sampler2D textureNoise;
uniform float uDistForward;
uniform float uYOffset;

varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vGrassNormal;
varying vec3 vPosition;
varying vec3 vColor;
varying float vHeight;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 posOffset 		= aPosOffset * vec3(1.0, 0.0, 1.0);
	posOffset.y 		-= 0.2;
	posOffset.z 		+= uDistForward;
	posOffset.z 		= mod(posOffset.z, uTerrainSize * 2.0);
	posOffset.z 		-= uTerrainSize;

	vec3 position 		= aVertexPosition;
	position.xz 		= rotate(position.xz, aExtra.y);
	vPosition 			= posOffset;
	position 			= posOffset + position * vec3(1.0, aPosOffset.y, 1.0);

	float u 			= (position.x / uTerrainSize * 0.5 + 0.5);
	float v 			= 1.0-(position.z / uTerrainSize * 0.5 + 0.5);

	vec2 uv 			= vec2(u, v);
	float colorHeight 	= texture2D(textureHeight, uv).r;
	position.y 			*= aPosOffset.y;
	position.y 			+= colorHeight * uMaxHeight;

	vec2 wind 			= texture2D(textureNoise, uv).rg - .5;
	wind 				*= aTextureCoord.y;
	position.xz 		+= wind * 2.0;
	position.y 			+= uYOffset;


    gl_Position 		= uVRProjectionMatrix * uVRViewMatrix * vec4(position, 1.0);
    vTextureCoord 		= aTextureCoord;
    vNormal 			= aNormal;
    vColor 				= aColor;
    vHeight 			= colorHeight;
    vUV					= uv;

    vGrassNormal 		= texture2D(textureNormal, uv).rgb * 2.0 - 1.0;
}