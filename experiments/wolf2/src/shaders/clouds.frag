// cloud.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;
uniform float uOpacity;

void main(void) {
    gl_FragColor = texture2D(texture, vTextureCoord);
    gl_FragColor.a *= uOpacity * smoothstep(3.0, 7.0, vPosition.y);
}