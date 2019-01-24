// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform float uTotalSize;
uniform float uOffset;

varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vNormal;

void main(void) {
	vec3 pos      = aVertexPosition;
	float l       = length(pos.xy);
	pos.xy        = normalize(pos.xy) * l * (1.0 - uOffset * aTextureCoord.x);
	gl_Position   = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal       = aNormal;
	
	vUV           = aVertexPosition.xy / uTotalSize;
}