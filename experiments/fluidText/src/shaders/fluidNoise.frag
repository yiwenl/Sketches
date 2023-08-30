// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float uSeed;
uniform float uNoiseScale;
#pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)

void main(void) {
    vec3 noise = curlNoise(vec3(vTextureCoord, uSeed) * uNoiseScale);
    gl_FragColor = vec4(noise, 1.0);
}