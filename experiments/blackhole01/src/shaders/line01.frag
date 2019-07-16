// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vDebug;
uniform sampler2D texture;
uniform vec3 uColor;

void main(void) {
    // gl_FragColor = vec4(vNormal * .5 + .5, 1.0);
    // gl_FragColor = vec4(vTextureCoord, 0.0, 1.0);
    gl_FragColor = vec4(vec3(uColor), vDebug.x);
    // gl_FragColor = vec4(vDebug, 1.0);
}