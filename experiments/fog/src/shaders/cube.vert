// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uOrigin;
uniform vec3 uDir;

varying vec2 vTextureCoord;
varying vec3 vNormal;


#define PI 3.141592653

void main(void) {

	vec3 vFromOrigin = aPosOffset - uOrigin;
	vec3 dirFromOrgin = normalize(vFromOrigin);
	float angle = acos(dot(dirFromOrgin, uDir));
	float offset = angle < PI * 0.25 ? 1.0 : 0.0;

	float distToLine = sin(angle) * length(vFromOrigin);
	float distToIntersect = cos(angle) * length(vFromOrigin);
	distToIntersect = max(distToIntersect, 0.0);
	distToIntersect *= 0.25;


	float d = smoothstep(distToIntersect*1.01, distToIntersect, distToLine);
	d *= offset;
	d = mix(d, 1.0, .05);



	vec3 pos      = aVertexPosition * d + aPosOffset;
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
}