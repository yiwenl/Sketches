// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;
uniform float time;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;
varying vec4 vShadowCoord;

const float radius = 0.015;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	vec4 wsPosition  = uModelMatrix * vec4(pos, 1.0);
	gl_Position  = uProjectionMatrix * uViewMatrix * wsPosition;
	

	float g 	 = sin(extra.r + time * mix(extra.b, 1.0, .5));
	g 			 = smoothstep(0.0, 1.0, g);
	g 			 = mix(g, 1.0, .75);
	vColor       = vec4(vec3(g), 1.0);

	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset * (1.0 + extra.x * 1.0);

	vNormal 	 = aNormal;
	vShadowCoord = uShadowMatrix * wsPosition;
}