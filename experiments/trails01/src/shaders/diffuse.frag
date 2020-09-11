// copy.frag

precision highp float;
varying vec3 vNormal;
#pragma glslify: diffuse    = require(glsl-utils/diffuse.glsl)

#define LIGHT vec3(0.2, -0.5, 1.0)

void main(void) {
    float d = diffuse(vNormal, LIGHT, .5);
    gl_FragColor = vec4(vec3(d), 1.0);
}