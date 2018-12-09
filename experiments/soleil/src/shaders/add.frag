// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;

uniform sampler2D texture0;
uniform sampler2D texture1;

uniform float uTime;

void main(void) {

  vec4 color0 = texture2D(texture0, vTextureCoord);
  vec4 color1 = texture2D(texture1, vTextureCoord);

  gl_FragColor = color0 * 0.8 + color1;

}