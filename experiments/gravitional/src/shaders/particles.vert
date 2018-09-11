// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform vec2 uViewport;
uniform sampler2D textureHeight;
uniform sampler2D textureNoise;
uniform float uWaveHeight;
uniform float uTime;
uniform float uTheta;
uniform float uRange;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vShadowCoord;
varying vec3 vDebug;

const float radius = 0.005;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}


void main(void) {
	vec3 position    = aVertexPosition;
	float a          = mix(aNormal.x, 1.0, .25) * uTime * 0.0 + aNormal.y;
	position.xz      = rotate(position.xz, a + uTheta);
	
	vec2 uv          = position.xz / (uRange / 2.0);
	uv               = uv * .5 + .5;
	
	float noise      = texture2D(textureNoise, uv).r;
	float h          = texture2D(textureHeight, uv).r;
	vDebug			 = vec3(h);
	position.y       = h * uWaveHeight * mix(noise, 1.0, .5);

	vPosition 		 = position;
	
	vec4 wsPosition  = uModelMatrix * vec4(position, 1.0);
	gl_Position      = uProjectionMatrix * uViewMatrix * wsPosition;
	vTextureCoord    = aTextureCoord;
	vNormal          = aNormal;
	vShadowCoord     = uShadowMatrix * wsPosition;
	
	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize     = distOffset * (1.0 + aNormal.x * 0.5);
}