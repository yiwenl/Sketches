// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying float vOpacity;

void main(void) {
    gl_FragColor = vec4(vec3(1.0), vOpacity);
    gl_FragColor = vec4(vOpacity);
}