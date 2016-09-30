// dome.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uRadius;
uniform vec3 uWaveCenter;
uniform float uWaveLength;
uniform float uWaveFront;
uniform float uWaveHeight;


varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vOffset;
varying float vFront;
varying vec3 vPosition;
varying vec3 vWaveCenter;


void main(void) {
	vec3 pos 			= aVertexPosition;
	vec3 center 		= normalize(uWaveCenter) * uRadius;
	vec3 dir 			= normalize(aVertexPosition);
	float distToCenter 	= distance(aVertexPosition, center);
	float distToWave 	= distance(distToCenter, uWaveFront);
	vPosition  			= pos;
	vWaveCenter 		= center;

	float scale 		= smoothstep(0.0, uWaveLength, distToWave);
	float offset 		= 0.0;
	if(distToCenter < uWaveFront) {
		offset = 1.0;
	} else {
		offset = 1.0 - scale;
	}
	pos 				= pos - dir * (scale + 1.0) * uWaveHeight;

    gl_Position 		= uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord 		= aTextureCoord;
    vNormal 			= aNormal;
}