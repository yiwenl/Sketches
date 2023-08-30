// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float uSeed;
uniform float uNoiseScale;
#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    float noise = snoise(vec3(vTextureCoord, uSeed) * uNoiseScale);
    float t = 0.5;
    noise = smoothstep(0.0, t, noise);
    gl_FragColor = vec4(vec3(noise), 1.0);
}