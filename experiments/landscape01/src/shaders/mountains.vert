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

uniform float uMountainHeight;
uniform float uMountainScale;

varying vec2 vTextureCoord;
varying vec3 vNormal;



void main(void) {

	float d       = length(aVertexPosition.xz);
	d             = smoothstep(0.5, 0.0, d);
	
	d             = pow(d, 1.0 + aPosOffset.y * 2.0);
	
	vec3 pos      = aVertexPosition;
	pos.y         = d * uMountainHeight;
	pos.xz        *= 1.0 + aExtra.x * 0.5;
	pos.y         *= 1.0 + aExtra.y * 0.5;
	
	pos           *= uMountainScale;
	
	pos.xz        += aPosOffset.xz;
	
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
}