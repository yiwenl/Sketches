// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform mat4 uShadowMatrix;
uniform sampler2D textureDepth;
uniform mat3 uModelViewMatrixInverse;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vPositionOrg;
varying vec4 vWsPosition;
varying vec4 vShadowCoord;
varying float vShadow;


void main(void) {
	vec3 position = (uModelMatrix * vec4(aVertexPosition + aPosOffset, 1.0)).xyz;
	vPositionOrg = position;
	// position 	  = (uModelMatrix * vec4(position, 1.0)).xyz;
	position 	  = uModelViewMatrixInverse * position;
	vec4 wsPosition = uModelMatrix * vec4(position, 1.0);
	vWsPosition     = wsPosition;


	gl_Position     = uProjectionMatrix * uViewMatrix * wsPosition; 
	vTextureCoord   = aTextureCoord;
	vNormal         = aNormal;
	vPosition 	  = position;
	
	vShadowCoord    = uShadowMatrix * wsPosition;

	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
}