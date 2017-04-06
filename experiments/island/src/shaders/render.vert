// render.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;
uniform float time;
uniform vec2 uViewport;
uniform float uEnd;
uniform float uLength;
uniform float uNumSeg;

varying vec4 vColor;
varying vec3 vNormal;

const float radius = 0.015;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

	float a 	 = 1.0;
	if(extra.b > uEnd + uLength) {
		a = 0.0;
	} else if(extra.b > uEnd ) {
		a = smoothstep(uEnd + uLength, uEnd, extra.b);
	}

	if(extra.b < uNumSeg) {
		a = smoothstep(0.0, uNumSeg, extra.b);
	}

	if(length(posNext) < length(posCurr)) {
		a = 0.0;
	}

	a = pow(a, 3.0);
	
	vColor       = vec4(vec3(1.0, 0.0, 0.0), a);

	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset * (1.0 + extra.x * 1.0);

	vNormal 	 = aNormal;
}