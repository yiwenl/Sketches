// copy.frag

precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 uLightPos;

uniform sampler2D textureFront;
uniform sampler2D textureBack;

uniform mat4 uModelMatrix;
uniform mat4 uShadowMatrix0;
uniform mat4 uShadowMatrix1;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

vec4 getProjPos(mat4 shadowMatrix, sampler2D texture, vec3 position) {
	vec4 shadowCoord = shadowMatrix * uModelMatrix * vec4(position, 1.0);
	shadowCoord      = shadowCoord / shadowCoord.w;
	vec4 color       = texture2DProj(texture, shadowCoord);
	return color;
}


void main(void) {
	vec3 pos 			= vPosition;
	vec4 color0 		= getProjPos(uShadowMatrix0, textureFront, pos);
	vec4 color1 		= getProjPos(uShadowMatrix1, textureBack, pos);
	float isIn 			= 1.0;
	

	if(pos.z > color0.z) {
		isIn = 0.0;
	} else if(pos.z < color1.z) {
		isIn = 0.0;
	}

	if(isIn < 1.0) {
		discard;
	}


	float d = diffuse(-vNormal, uLightPos);
	d = mix(d, 1.0, .5);
    gl_FragColor = vec4(vec3(d), 1.0);
}