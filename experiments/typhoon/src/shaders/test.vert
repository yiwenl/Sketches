// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aLatLng;
attribute vec2 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform float uSize;
uniform float uRadius;
uniform float uOffset;
uniform float uTime;
uniform float uShift;

varying vec2 vTextureCoord;
varying vec3 vNormal;

#define PI 3.141592653
#define RAD PI/180.0

vec3 getPlanePos( vec2 latlng ) {
	float lat   = latlng.x;
	float lng   = latlng.y;
	
	float z     = -(uSize * 0.5) * lat/90.0;
	float x     = -lng/180.0 * uSize;
	float shift = uShift / PI / 2.0;
	x           -= shift * uSize * 2.0;
	x           = mod(x + uSize, uSize * 2.0) - uSize;

	return vec3(x, aExtra.x + aLatLng.z * 0.05, z);
}

vec3 getSpherePos( vec2 latlng ) {
	float lat = latlng.x * RAD;
	float lng = latlng.y * RAD + uShift;	

	float r = uRadius * (1.0 + aExtra.x * 0.25);

	float y = sin(lat) * r;
	float rr = cos(lat) * r;
	float x = sin(-lng) * rr;
	float z = cos(-lng) * rr;

	return vec3(x, y, z);

}

void main(void) {
	vec3 posPlane  = getPlanePos(aLatLng.xy);
	vec3 posSphere = getSpherePos(aLatLng.xy);
	vec3 posOffset = mix(posPlane, posSphere, uOffset);

	float t = mod(uTime, 2.0);
	float d = distance(t, aLatLng.z);
	float r = 0.1;
	float s = smoothstep(r, 0.0, d);
	float scale = 1.0 + pow(s, 1.5) * 10.0;

	vec3 pos       = aVertexPosition * scale + posOffset;
	gl_Position    = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord  = aTextureCoord;
	vNormal        = uNormalMatrix * aNormal;
}