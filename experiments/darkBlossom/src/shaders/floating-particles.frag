#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vColor;
uniform vec3 uColor;
uniform vec3 uColorShadow;

out vec4 oColor;

uniform vec3 uLight;
#pragma glslify: diffuse    = require(./glsl-utils/diffuse.glsl)

void main(void) {
    vec3 n = vNormal;
    if(!gl_FrontFacing) {
        n = -n;
    }

    float d = diffuse(uLight, n);
    d = smoothstep(0.0, 0.5, d);
    d = mix(d, 1.0, .65);

    vec3 color = mix(uColorShadow, uColor, d);

    oColor = vec4(color, 1.0);
}