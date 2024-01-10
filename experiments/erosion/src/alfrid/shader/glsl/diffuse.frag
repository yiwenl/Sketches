precision highp float;

varying vec3 vNormal;

uniform vec3 uColor;
uniform vec3 uLight;
uniform float uLightIntensity;

#pragma glslify: diffuse    = require(glsl-utils/diffuse.glsl)

void main(void) {
    float g = diffuse(vNormal, uLight, uLightIntensity);
    gl_FragColor = vec4(uColor * g, 1.0);
}