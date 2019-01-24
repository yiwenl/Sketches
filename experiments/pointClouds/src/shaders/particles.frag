// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vColor;
varying vec3 vPosition;

uniform sampler2D textureParticle;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

#define PI 3.141592653


vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
    // with conditionals, may be worth benchmarking
    // return vec3(
    //     base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
    //     base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
    //     base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
    // );
}

void main(void) {
	if(length(vPosition) <= 0.1) {
		discard;
	}

	vec2 uv = rotate(gl_PointCoord, vTextureCoord.y * PI * 2.0);
	uv.x *= 4.0;
	uv *= vec2(0.25, 1.0);
	uv += vec2(vTextureCoord.x, 0.0);
	vec4 color = texture2D(textureParticle, uv);
	if(color.a <= 0.3) {
		discard;
	}
	color.rgb = mix(color.rgb, vec3(1.0), .25);

	color.rgb = blendOverlay(color.rgb, vColor) * vColor;

    gl_FragColor = vec4(color);
}