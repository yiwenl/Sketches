// sky.frag
// basic.frag

#define SHADER_NAME SKYBOX_FRAGMENT

precision mediump float;
uniform samplerCube textureCurr;
uniform samplerCube textureNext;
uniform float uOffset;
varying vec2 vTextureCoord;
varying vec3 vVertex;

void main(void) {
    vec4 curr = textureCube(textureCurr, vVertex);
    vec4 next = textureCube(textureNext, vVertex);
    gl_FragColor = mix(curr, next, uOffset);
}