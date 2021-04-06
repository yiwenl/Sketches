// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;
uniform vec3 uLight;

#pragma glslify: diffuse = require(glsl-utils/diffuse.glsl)

void main(void) {
    float d = diffuse(vNormal, uLight, .6) * 2.0;
    // d = mix(d, 1.0, .5);
    gl_FragColor = vec4(vec3(d), 1.0);
    // gl_FragColor = vec4(1.0);
}