precision highp float;

uniform vec3 lightDir;
uniform vec3 uDimension;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

const float bias = -0.001;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


float pointDistToPlane(vec3 v, vec4 plane) {
	vec3 n = normalize(plane.xyz);

	float d = v.x * n.x + v.y * n.y + v.z * n.z;

	return d;
}

void main(void) {
	float _diffuse   = diffuse(vNormal, lightDir);
	_diffuse = mix(_diffuse, 1.0, .5);

    if(vPosition.x > uDimension.x) {
    	discard;
    } else if(vPosition.x < -uDimension.x) {
    	discard;
    }

    if(vPosition.y > uDimension.y) {
    	discard;
    } else if(vPosition.y < -uDimension.y) {
    	discard;
    }

    if(vPosition.z > uDimension.z) {
    	discard;
    } else if(vPosition.z < -uDimension.z) {
    	discard;
    }


	gl_FragColor = vec4(vec3(_diffuse), 1.0);
}