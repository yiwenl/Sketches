#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uTranslate;
uniform vec3 uScale;
uniform vec3 uRotation;

out vec2 vTextureCoord;
out vec3 vNormal;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, s, -s, c);
	return m * v;
}

void main(void) {
  vec3 pos = aVertexPosition * uScale;
  pos.yz = rotate(pos.yz, uRotation.x);
  pos.xz = rotate(pos.xz, uRotation.y);
  pos.xy = rotate(pos.xy, uRotation.z);
  pos += uTranslate;

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
  vTextureCoord = aTextureCoord;
  vNormal = aNormal;
}