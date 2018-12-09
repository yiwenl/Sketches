// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texture;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vScreenPos;
varying vec3 vPosition;
varying float vDebug;

void main(void) {
	float h       = texture2D(texture, aTextureCoord).r;
	vDebug        = h;
	vec3 pos      = aVertexPosition;
	pos.y         = h * 1.5;
	vScreenPos    = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	gl_Position   = vScreenPos;
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	vPosition = aVertexPosition;
}