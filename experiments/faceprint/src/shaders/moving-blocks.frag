// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uNum;
uniform float uTime;
uniform float uEase;

#define threshold 0.1
#define range 0.05

#pragma glslify: snoise    = require(glsl-utils/snoise.glsl)
#pragma glslify: ease     = require(./easings/sine-in-out.glsl)

void main(void) {
	vec2 uv = floor(vTextureCoord * uNum) / uNum;
	float noiseScale = 5.0;

    float time = uTime;

    if(uEase > .5) {
        float t0 = floor(time);
        float t1 = fract(time);
        t1 = ease(t1);

        time = t0 + t1;    
    } 
    

	float noise = snoise(vec3(uv * noiseScale, time));
	// const float threshold = 0.15;
	noise = smoothstep(threshold, threshold + range, noise);
    noise = ease(noise);
    gl_FragColor = vec4(vec3(1.0), noise);
}