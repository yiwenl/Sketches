// reflection.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
uniform samplerCube texture;
varying vec2 vTextureCoord;

varying vec3 vNormalWorldSpace;
varying vec3 vEyeDirWorldSpace;


void main(void) {
    vec3 reflectedEyeWorldSpace = reflect( vEyeDirWorldSpace, normalize(vNormalWorldSpace) );
    gl_FragColor = textureCube(texture, reflectedEyeWorldSpace);
}