// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vDebug;

#pragma glslify: diffuse    = require(glsl-utils/diffuse.glsl)
#define LIGHT vec3(0.8, 1.0, 0.6)

void main(void) {
    float d = diffuse(vNormal, LIGHT);
    d = mix(d, 1.0, .5);
    gl_FragColor = vec4(vec3(d), 1.0);
    // gl_FragColor = vec4(vDebug.xxx, 1.0);
}