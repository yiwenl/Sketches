// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureHeight;
uniform sampler2D textureNormal;

uniform vec3 uLightPos;

varying vec3 vPosition;
varying vec4 vFinalPos;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	float h = vPosition.y * 15.0;
	float elevationLines = fract(h);
	vec4 color = texture2D(textureHeight, vTextureCoord);
	color.a = 0.5;

	vec3 N = texture2D(textureNormal, vTextureCoord).rbg;
	float d = diffuse(N, uLightPos);
	color.rgb *= d;


	vec4 lineColor = mod(h, 5.0) < 1.0 ? vec4(0.75, 0.0, 0.0, 1.0) : vec4(vec3(0.5), 1.0);
	elevationLines = abs(elevationLines - 0.5);
	float s = 0.00;
	float r = 0.02 * pow(vFinalPos.w, 1.15);
	elevationLines = smoothstep( s + r, s, elevationLines);
	elevationLines = pow(elevationLines, 3.0);
	color += elevationLines * lineColor;

	

    gl_FragColor = color;
}