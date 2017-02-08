// renderTemp.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureColor;
uniform sampler2D textureExtra;
uniform float percent;
uniform vec2 uViewport;
uniform float time;

varying vec4 vColor;
varying vec3 vNormal;

const float radius = 0.01;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	float g 	 = sin(extra.r + time * 5.0 * mix(extra.b, 1.0, .5)) * .5 + .5;
	vColor       = texture2D(textureColor, uv);
	vColor.rgb 	 *= 1.0 + pow(g, 5.0) * 0.7;
	vNormal 	 = aNormal;



	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset * (0.25 + extra.x * 0.1);
}