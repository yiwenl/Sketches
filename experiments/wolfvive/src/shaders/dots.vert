// dots.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uMaxHeight;
uniform float uTerrainSize;
uniform sampler2D texture;
uniform float uDistForward;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vHeight;
varying vec3 vPosition;

void main(void) {
	vec3 posOffset = aPosOffset;
	posOffset.z += uDistForward;
	posOffset.z = mod(posOffset.z, uTerrainSize * 2.0);
	posOffset.z -= uTerrainSize;

	vec3 position = aVertexPosition + posOffset;
	vPosition = posOffset;

	float u = (position.x / uTerrainSize * 0.5 + 0.5);
	float v = 1.0-(position.z / uTerrainSize * 0.5 + 0.5);

	vec2 uv = vec2(u, v);
 
	float colorHeight = texture2D(texture, uv).r;
	position.y += colorHeight * uMaxHeight;
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(position, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vHeight = colorHeight;
}