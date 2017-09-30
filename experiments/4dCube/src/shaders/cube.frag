// copy.frag
precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec4 uPlane;
uniform vec3 lightDir;


float pointDistToPlane(vec3 v, vec4 plane) {
	vec3 n = normalize(plane.xyz);

	float d = v.x * n.x + v.y * n.y + v.z * n.z;

	return d;
}


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	float dist = pointDistToPlane(vPosition, uPlane);

	if(dist > uPlane.w) {
		discard;
	}

	float d = diffuse(vNormal, lightDir);
	d = mix(d, 1.0, .5);

    gl_FragColor = vec4(vec3(d), 1.0);
}