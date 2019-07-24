// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform sampler2D texture;
uniform float uCap;
uniform float uHeight;

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;



float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main(void) {
	vec3 color              = texture2D(texture, aTextureCoord).rgb;
	float h                 = luma(color) * uHeight;
	h 						= min(uCap, h);
	vec3 position           = aVertexPosition;
	position.y 				+= h;
	vec4 worldSpacePosition = uModelMatrix * vec4(position, 1.0);
	vec4 viewSpacePosition  = uViewMatrix * worldSpacePosition;
	
	vNormal                 = uNormalMatrix * aNormal;
	vPosition               = viewSpacePosition.xyz;
	vWsPosition             = worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace    = viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition            = -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal               = normalize( uModelViewMatrixInverse * vNormal );
	
	gl_Position             = uProjectionMatrix * viewSpacePosition;
	
	vTextureCoord           = aTextureCoord;
}