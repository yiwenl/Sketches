// grass.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;
attribute vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uMaxHeight;
uniform float uTerrainSize;
uniform sampler2D texture;
uniform sampler2D textureHeight;
uniform sampler2D textureNormal;
uniform float uDistForward;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vGrassNormal;
varying vec3 vPosition;
varying vec3 vColor;
varying float vHeight;

void main(void) {
	vec3 posOffset 		= aPosOffset * vec3(1.0, 0.0, 1.0);
	posOffset.y 		-= 0.2;
	posOffset.z 		+= uDistForward;
	posOffset.z 		= mod(posOffset.z, uTerrainSize * 2.0);
	posOffset.z 		-= uTerrainSize;

	vPosition 			= posOffset;
	vec3 position 		= posOffset + aVertexPosition * vec3(1.0, aVertexPosition.y, 1.0);
	
	float u 			= (position.x / uTerrainSize * 0.5 + 0.5);
	float v 			= 1.0-(position.z / uTerrainSize * 0.5 + 0.5);

	vec2 uv = vec2(u, v);
	float colorHeight 	= texture2D(textureHeight, uv).r;
	position.y 			+= colorHeight * uMaxHeight;


    gl_Position 		= uProjectionMatrix * uViewMatrix * vec4(position, 1.0);
    vTextureCoord 		= aTextureCoord;
    vNormal 			= aNormal;
    vColor 				= aColor;
    vHeight 			= colorHeight;


    vGrassNormal 		= texture2D(textureNormal, uv).rgb * 2.0 - 1.0;

}