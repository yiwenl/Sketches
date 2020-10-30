precision highp float;
varying vec3 vNormal;
uniform vec3 uLightPos;

#pragma glslify: diffuse = require(glsl-utils/diffuse.glsl)

void main(void) {
    float d = diffuse(vNormal, uLightPos, .75);
    gl_FragColor = vec4(vec3(d), 1.0);
}