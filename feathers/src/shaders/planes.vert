// planes.vert


precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform mat3 uModelViewMatrixInverse;
uniform mat3 uNormalMatrix;

uniform sampler2D texture;
uniform sampler2D textureNext;
uniform float percent;
uniform float flip;
uniform float uvIndex;
uniform float numSlides;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;
varying vec3 vVertex;
varying vec3 vExtra;
varying vec4 vShadowCoord;


const float PI = 3.141592657;

const mat4 biasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
							  0.0, 0.5, 0.0, 0.0,
							  0.0, 0.0, 0.5, 0.0,
							  0.5, 0.5, 0.5, 1.0 );

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
	vec3 rr = vec3(sin(roll), cos(roll), 0.0);
	vec3 ww = normalize(target - origin);
	vec3 uu = normalize(cross(ww, rr));
	vec3 vv = normalize(cross(uu, ww));

	return mat3(uu, vv, ww);
}

void main(void) {
	vec2 uv         = aTextureCoord * .5;
	
	uv              *= .5;		
	float uvSize    = .5/numSlides;
	float tx        = mod(uvIndex, numSlides) * uvSize;
	float ty        = floor(uvIndex / numSlides) * uvSize;
	uv              += vec2(tx, ty);
	vec3 currPos    = texture2D(texture, uv).rgb;
	vec3 nextPos    = texture2D(textureNext, uv).rgb;
	vec3 pos        = mix(currPos, nextPos, percent);

	mat3 mLookAt 	= calcLookAtMatrix(currPos, nextPos, 1.0);
	pos 			+= mLookAt * aVertexPosition;

	vShadowCoord    = ( biasMatrix * uShadowMatrix ) * vec4(pos, 1.0);
	
	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
	vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;

	vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize(mLookAt*aNormal);

	// vec4 mvPosition = uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	// vec4 V          = uProjectionMatrix * mvPosition;
	// gl_Position     = V;

	gl_Position				= uProjectionMatrix * viewSpacePosition;
	
	
	vNormal         = normalize(mLookAt*aNormal);
	vVertex         = pos;
	vExtra          = aExtra;
}