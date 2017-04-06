// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float uNumSeg;
uniform float uEnd;
uniform float uLength;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying float vAlpha;

void main(void) {

	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 extra = texture2D(textureExtra, uv).rgb;

	float a 	 = 1.0;
	if(extra.b > uEnd + uLength) {
		a = 0.0;
	} else if(extra.b > uEnd ) {
		a = smoothstep(uEnd + uLength, uEnd, extra.b);
	}


	const float lr = 20.0;

	if(extra.b < uNumSeg) {
		a = 0.0;
	} else if(extra.b < uNumSeg + lr) {
		a = smoothstep(uNumSeg, uNumSeg + lr, extra.b);
	}

	float dCurr = length(posCurr);
	float dNext = length(posNext);

	a = pow(a, 3.0);

	vAlpha = a;

	vec3 position = mix(posCurr, posNext, aVertexPosition.z);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vNormal = aNormal;
}