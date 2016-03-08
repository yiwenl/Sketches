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
uniform vec2 uvOffset;
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


vec3 getRotationAxis(vec3 a, vec3 b) {
	vec3 axis = normalize(cross(a, b));
	return axis;
}

float angleBetween(vec3 a, vec3 b) {
	return acos(dot(a, b));
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, mat4 m) {
	return (m * vec4(v, 1.0)).xyz;
}

void main(void) {
	vec2 uv         = aTextureCoord;
	uv              += uvOffset;
	vec3 currPos    = texture2D(texture, uv).rgb;
	vec3 nextPos    = texture2D(textureNext, uv).rgb;
	vec3 pos        = mix(currPos, nextPos, percent);


	vec3 vFront 	= vec3(0.0, 0.0, -1.0);
	vec3 vDir 	    = normalize(nextPos - currPos);
	vec3 axis 		= getRotationAxis(vFront, vDir);
	float angle 	= angleBetween(vFront, vDir);
	mat4 mtxRot 	= rotationMatrix(axis, angle);



	// mat3 mLookAt 	= calcLookAtMatrix(currPos, nextPos, 1.0);
	// pos 			+= mLookAt * aVertexPosition;
	float l 		= length(aVertexPosition);
	vec3 posOffset  = rotate(aVertexPosition, mtxRot);
	posOffset 		= normalize(posOffset) * l;
	pos 			+= posOffset;
	

	vShadowCoord    = ( biasMatrix * uShadowMatrix ) * vec4(pos, 1.0);
	
	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
	vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;

	vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	// vWsNormal				= normalize(mLookAt*aNormal);
	vWsNormal				= normalize(rotate(aNormal, mtxRot));

	// vec4 mvPosition = uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	// vec4 V          = uProjectionMatrix * mvPosition;
	// gl_Position     = V;

	gl_Position				= uProjectionMatrix * viewSpacePosition;
	
	
	vNormal         = vWsNormal;
	vVertex         = pos;
	vExtra          = aExtra;
}