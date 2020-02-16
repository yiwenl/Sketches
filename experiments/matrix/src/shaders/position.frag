// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;

void main(void) {
    gl_FragColor = vec4(vPosition, 1.0);
}