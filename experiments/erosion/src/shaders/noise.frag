// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float uSeed;

#pragma glslify: snoise    = require(glsl-utils/snoise.glsl)

void main(void) {
    float noise = snoise(vec3(vTextureCoord * 4.0, uSeed)) * .5 + .5;
    gl_FragColor = vec4(vec3(noise), 1.0);
}