// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform float opacity;

void main(void) {

    gl_FragColor = vec4(vNormal * .5 + .5, opacity);
}