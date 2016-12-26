// floor.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform vec3 position;

varying vec4 vShadowCoord;
varying vec2 vTextureCoord;
varying vec3 vNormal;


const mat4 biasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
							  0.0, 0.5, 0.0, 0.0,
							  0.0, 0.0, 0.5, 0.0,
							  0.5, 0.5, 0.5, 1.0 );

void main(void) {
	vec3 pos      = position + aVertexPosition;
	gl_Position   = uProjectionMatrix * uViewMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	vShadowCoord  = ( biasMatrix * uShadowMatrix ) * vec4(pos, 1.0);;
}