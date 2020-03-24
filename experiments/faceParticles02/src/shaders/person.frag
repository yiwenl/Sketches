// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform vec3 uPosLight;

#pragma glslify: diffuse    = require(glsl-utils/diffuse.glsl)

void main(void) {
    float d = diffuse(vNormal, uPosLight, 0.75);
    d = (d - 0.25) * 2.0 + 0.5;
    // d *= 2.0;
    gl_FragColor = vec4(vec3(d), 1.0);
}