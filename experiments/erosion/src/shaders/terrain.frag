// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vDebug;
uniform sampler2D textureHeight;

void main(void) {
    gl_FragColor = vec4(vDebug.xy, 0.0, 1.0);
    gl_FragColor = vec4(vec3(vDebug.z), 1.0);
}