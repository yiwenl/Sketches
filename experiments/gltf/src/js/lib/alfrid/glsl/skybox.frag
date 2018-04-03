// basic.frag

#define SHADER_NAME SKYBOX_FRAGMENT

precision mediump float;
uniform samplerCube texture;
varying vec2 vTextureCoord;
varying vec3 vVertex;

void main(void) {
    gl_FragColor = textureCube(texture, vVertex);
}