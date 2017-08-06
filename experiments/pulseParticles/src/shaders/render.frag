precision highp float;

uniform sampler2D textureDepth;
uniform float bias;

varying vec4 vColor;
varying vec4 vShadowCoord;

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
		visibility = 0.1;
	}

	vec4 color = vColor;
	color.rgb *= vec3(visibility);

	gl_FragColor = color;
}