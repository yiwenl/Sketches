// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
// uniform sampler2D texture;

void main(void) {
    gl_FragColor = vec4(vNormal * .5 + .5, 1.0);
}