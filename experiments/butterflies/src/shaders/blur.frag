// blur.frag
#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureDepth;
uniform vec2 uDirection;
uniform vec2 uResolution;
uniform float uFocus;

vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction, float rangeOffset) {
	vec4 color = vec4(0.0);
	vec2 off1 = vec2(1.3846153846) * direction;
	vec2 off2 = vec2(3.2307692308) * direction;
	color += texture2D(image, uv) * 0.2270270270;
	color += texture2D(image, uv + (off1 / resolution) * rangeOffset) * 0.3162162162;
	color += texture2D(image, uv - (off1 / resolution) * rangeOffset) * 0.3162162162;
	color += texture2D(image, uv + (off2 / resolution) * rangeOffset) * 0.0702702703;
	color += texture2D(image, uv - (off2 / resolution) * rangeOffset) * 0.0702702703;
	return color;
}

float getDepth(float z, float n, float f) {
	return (2.0 * n) / (f + n - z*(f-n));
}


#define LOG2 1.442695
#define density 0.01
#define fogColor vec4(1.0, 1.0, 1.0, 0.0)

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    float colorDepth = texture2D(textureDepth, vTextureCoord).r;

    float normalizeDepth = getDepth(colorDepth, .1, 100.0);

    float offset;
    if(normalizeDepth <= uFocus) {
    	offset = normalizeDepth / uFocus;
    } else {
    	offset = 1.0 - (normalizeDepth - uFocus) / (1.0 - uFocus);
    }

    offset = pow(offset, 5.0);

    vec4 colorBlur = blur9(texture, vTextureCoord, uResolution, uDirection, 1.0-offset);
    gl_FragColor = colorBlur;
}