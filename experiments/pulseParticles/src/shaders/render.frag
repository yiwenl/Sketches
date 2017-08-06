precision highp float;

uniform sampler2D textureDepth;
uniform float bias;
uniform vec3 light;

varying vec4 vColor;
varying vec4 vShadowCoord;
varying vec3 vWorldPosition;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	if(vColor.a <= 0.0) {
		discard;
	}
	if(distance(gl_PointCoord, vec2(.5)) > .5) discard;


	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;

	vec2 uv = shadowCoord.xy;
	float d = texture2D(textureDepth, uv).r;

	float visibility = 1.0;
	if(d < shadowCoord.z - bias) {
		visibility = 0.15;
	}

	vec4 color = vColor;
	color.rgb *= vec3(visibility);



	vec3 N = normalize(vWorldPosition);
	float diff = diffuse(N, light);
	diff = mix(diff, 1.0, .5);

	color.rgb *= diff;

	gl_FragColor = color;
}