// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureExtra;
uniform sampler2D textureNeighbour;
uniform sampler2D textureGradient;
uniform float percent;
uniform float time;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;

const float radius = 0.01;


void main(void) {
	vec2 uv          = aVertexPosition.xy;
	vec3 pos         = texture2D(textureCurr, uv).rgb;
	vec3 extra       = texture2D(textureExtra, uv).rgb;
	float neighbour  = texture2D(textureNeighbour, uv).r;
	gl_Position      = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	float g          = sin(extra.r + time * mix(extra.b, 1.0, .5));
	g                = smoothstep(0.0, 1.0, g);
	g                = mix(g, 1.0, .5);
	
	vec3 gradient    = texture2D(textureGradient, vec2(neighbour, .5)).rgb;
	vColor           = vec4(gradient, 1.0);
	
	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	gl_PointSize     = distOffset * (1.0 + extra.x * 1.0);
	
	vNormal          = aNormal;
}