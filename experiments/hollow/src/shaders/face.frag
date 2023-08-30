// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vPosition;
varying vec2 vTextureCoord;

void main(void) {
    gl_FragColor = vec4(vPosition, 1.0);
}