// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;
uniform vec3 uCameraPos;

uniform sampler2D texture;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vColor;

const float radius = 0.05;

void main(void) {
	gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
	vNormal = aNormal;


	float distToCamera = distance(aVertexPosition, uCameraPos);

	float maxRadius = 1.0;
	float scale = smoothstep(0.0, maxRadius, distToCamera);

	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize = distOffset * mix(aTextureCoord.x, 1.0, .2) * scale;

	vec2 uv = gl_Position.xy / gl_Position.w * .5 + .5;

	uv += (aTextureCoord - .5) * 0.01;
	// vColor = vec4(uv, 0.0, 1.0);
	vColor = texture2D(texture, uv);
}