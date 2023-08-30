// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vWsPosition;

void main(void) {
    gl_FragColor = vec4(vWsPosition, 1.0);
}