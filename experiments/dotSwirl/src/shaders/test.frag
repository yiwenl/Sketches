// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform vec3 		color;
uniform float 		uTime;
uniform vec2 		uv;

void main(void) {
    gl_FragColor = texture2D(texture, vTextureCoord);
}