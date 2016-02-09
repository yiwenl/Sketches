// reflection.vert

#define SHADER_NAME REFLECTION_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform vec3 position;
uniform vec3 scale;

varying vec2 vTextureCoord;

varying vec3 vNormalWorldSpace;
varying vec3 vEyeDirWorldSpace;
varying vec3 vNormal;

void main(void) {
	vec3 pos               = aVertexPosition * scale + position;
	vec4 positionViewSpace = uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vec4 eyeDirViewSpace   = positionViewSpace - vec4( 0, 0, 0, 1 );
	vEyeDirWorldSpace      = vec3( uModelViewMatrixInverse * eyeDirViewSpace.rgb );
	vec3 normalViewSpace   = uNormalMatrix * aNormal;
	vNormalWorldSpace      = normalize( vec3( vec4( normalViewSpace, 0 ) * uViewMatrix ) );		
	
	vTextureCoord          = aTextureCoord;
	gl_Position            = uProjectionMatrix * positionViewSpace;
}	
