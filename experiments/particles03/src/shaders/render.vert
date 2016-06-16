// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform sampler2D textureSphere;
uniform samplerCube uRadianceMap;
uniform samplerCube uIrradianceMap;

uniform vec2 uViewport;
uniform float percent;
uniform float time;
uniform float uRadius;

varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vNormal;
varying vec3 vExtra;
const float radius = 0.03;


void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;

	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;

    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;

	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );

	gl_Position				= uProjectionMatrix * viewSpacePosition;
	
	gl_PointSize = uViewport.y * uProjectionMatrix[1][1] * uRadius / gl_Position.w * (1.0 + extra.r * 5.0);
	

	vNormal 	 = aNormal;
	vExtra = extra;
}