// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D texture;
uniform float uHeight;
uniform vec2 uViewport;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vHeight;
varying vec4 vShadowCoord;

const float radius = 0.006;
// const float radius = 0.015;

void main(void) {
	vec3 pos         = aVertexPosition;
	pos.xz           += (aNormal.xy - .5) * 0.01;
	vec2 uv          = aTextureCoord;
	uv.y             = 1.0 - aTextureCoord.y;
	// uv            += (aNormal.yz - 0.5) * 0.0;
	pos.y            = pow(texture2D(texture, uv).r, 2.0) * uHeight * 0.5;
	vec4 wsPosition  = uModelMatrix * vec4(pos, 1.0);
	gl_Position      = uProjectionMatrix * uViewMatrix * wsPosition;
	vTextureCoord    = aTextureCoord;
	vNormal          = aNormal;
	
	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize     = distOffset * (1.0 + aNormal.z * 0.5);
	vHeight          = pos.y / uHeight * 3.5;

	vShadowCoord = uShadowMatrix * wsPosition;
}