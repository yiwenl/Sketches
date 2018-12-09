// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
varying vec4 vScreenPos;
varying float vDebug;
uniform sampler2D texture;
uniform vec3 uColorSet0[4];
uniform vec3 uColorSet1[4];
uniform float uPercent;
uniform float uSize;


vec3 getColor(vec3 colorSet[4], vec3 pos) {
	vec3 a = mix(colorSet[0], colorSet[1], pos.r);
	vec3 b = mix(colorSet[2], colorSet[3], pos.g);
	return mix(a, b, pos.b);
}

vec3 getColor(vec3 colorSet[4], vec2 uv) {
	vec3 a = mix(colorSet[0], colorSet[1], uv.x);
	vec3 b = mix(colorSet[2], colorSet[3], uv.x);
	return mix(a, b, uv.y);
}

void main(void) {
	vec3 colorPos = vScreenPos.xyz / vScreenPos.w;
	colorPos.rg   = colorPos.rg * .5 + .5;

	vec2 uv = vPosition.xz / uSize * .5 + .5;
	
	vec3 color0    = getColor(uColorSet0, uv);
	vec3 color1    = getColor(uColorSet1, uv);
	vec3 color = mix(color0, color1, uPercent);
	gl_FragColor  = vec4(color, 1.0);
	// gl_FragColor  = vec4(uv., 1.0);
}