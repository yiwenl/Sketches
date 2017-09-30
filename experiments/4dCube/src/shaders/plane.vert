// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uPlane;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;


mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
	vec3 rr = vec3(sin(roll), cos(roll), 0.0);
	vec3 ww = normalize(target - origin);
	vec3 uu = normalize(cross(ww, rr));
	vec3 vv = normalize(cross(uu, ww));

	return mat3(uu, vv, ww);
}


const vec3 center = vec3(0.0);

void main(void) {

	vec3 dir = normalize(uPlane.xyz);
	mat3 mtxRotate = calcLookAtMatrix(center, dir, 0.0);
	vec3 position = mtxRotate * aVertexPosition + dir * uPlane.w;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = mtxRotate * aNormal;

    vPosition = position;
}