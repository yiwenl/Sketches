// fish.vert

precision mediump float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;

varying vec2 vTextureCoord;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;


mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
	vec3 rr = vec3(sin(roll), cos(roll), 0.0);
	vec3 ww = normalize(target - origin);
	vec3 uu = normalize(cross(ww, rr));
	vec3 vv = normalize(cross(uu, ww));

	return mat3(uu, vv, ww);
}

#define UP vec3(0.0, 0.0, 1.0)


void main(void) {
	vec3 curr               = texture2D(textureCurr, aUV).xyz;
	vec3 next               = texture2D(textureNext, aUV).xyz;
	vec3 extra              = texture2D(textureExtra, aUV).xyz;
	mat3 mLookAt            = calcLookAtMatrix(curr, next, 0.0);
	vec3 scale 			    = mix(extra, vec3(1.0), .5) * 0.15;
	vec3 position           = mix(curr, next, percent) + mLookAt * aVertexPosition * scale;
	
	vec4 worldSpacePosition = uModelMatrix * vec4(position, 1.0);
	vec4 viewSpacePosition  = uViewMatrix * worldSpacePosition;
	
	vNormal                 = uNormalMatrix * mLookAt * aNormal;
	vPosition               = viewSpacePosition.xyz;
	vWsPosition             = worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace    = viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition            = -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal               = normalize( uModelViewMatrixInverse * mLookAt * vNormal );
	
	gl_Position             = uProjectionMatrix * viewSpacePosition;
	
	vTextureCoord           = aTextureCoord;
}
