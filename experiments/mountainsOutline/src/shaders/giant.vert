// reflection.vert

#define SHADER_NAME VERT_GIANT

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform float uRotation;
uniform mat4 uMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;
varying vec4 vViewSpace;


varying vec4 vCoords;

const mat4 biasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
							  0.0, 0.5, 0.0, 0.0,
							  0.0, 0.0, 0.5, 0.0,
							  0.5, 0.5, 0.5, 1.0 );


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


vec3 rotateY(vec3 v, float a) {
	vec3 newv = vec3(v);
	newv.xz = rotate(newv.xz, a);
	return newv;
}


void main(void) {
	vec3 position           = aVertexPosition;
	position                = rotateY(position, uRotation);
	vPosition               = position;
	vec4 worldSpacePosition = uModelMatrix * vec4(position, 1.0);
	vec4 viewSpacePosition  = uViewMatrix * worldSpacePosition;
	vNormal                 = rotateY(uNormalMatrix * aNormal, uRotation);
	vWsPosition             = worldSpacePosition.xyz;
	vViewSpace              = viewSpacePosition;
	
	vec4 eyeDirViewSpace    = viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition            = -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal               = normalize( uModelViewMatrixInverse * vNormal );
	
	gl_Position             = uProjectionMatrix * viewSpacePosition;
	vCoords                 = ( biasMatrix * uMatrix * uModelMatrix ) * vec4(position, 1.0);
	vTextureCoord           = aTextureCoord;
}
