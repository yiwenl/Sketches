// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;
uniform float uParticleScale;


uniform sampler2D texturePos;
uniform sampler2D textureColor;


varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;
varying vec3 vPosition;

const float radius = 0.005;

void main(void) {
	vec2 uv          = aVertexPosition.xy;
	vec3 pos         = texture2D(texturePos, uv).xyz;
	vColor           = texture2D(textureColor, uv).rgb;
	gl_Position      = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	vTextureCoord    = aTextureCoord;
	vNormal          = aNormal;
	vPosition 		 = pos;
	
	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize     = distOffset * (1.0 + aVertexPosition.z * 5.0) * uParticleScale;
}