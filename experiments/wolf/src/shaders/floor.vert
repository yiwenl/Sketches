// floor.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureHeight;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vHeight;

void main(void) {
	vec3 position = aVertexPosition;
	vec2 uv = aTextureCoord;
	uv.y = 1.0 - uv.y;

	// float heightOffset = 0.0;
	// const vec2 center = vec2(.5);
	// float distToCenter = distance(uv, center);
	// if(distToCenter < .5) {
	// 	heightOffset = 1.0 - distToCenter / 0.5;
	// }

	// float h = texture2D(textureHeight, uv).g * 5.0;
	// position.y += h - 5.0;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vTextureCoord = uv;
    vNormal = aNormal;
    vHeight = 0.0;
}