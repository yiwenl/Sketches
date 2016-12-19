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
uniform sampler2D textureTest;
uniform sampler2D textureNormal;
uniform sampler2D textureGradient;
uniform float percent;
uniform float time;
uniform float uMaxHeight;
uniform vec2 uViewport;

varying vec4 vColor;
varying vec3 vNormal;

const float radius = 0.01;


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

#define LIGHT vec3(1.0, 1.0, 1.0)

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	float a      = 1.0;
	if(posNext.x < posCurr.x) {
		a = 0.0;
	}

	float p = (pos.y-1.0) / uMaxHeight;
	p = mix(p, extra.b, .5);
	vec4 color = texture2D(textureGradient, vec2(p, .5));
	vec2 uvMap = texture2D(textureTest, uv).xy;
	vec3 N = texture2D(textureNormal, uvMap).rbg * 2.0 - 1.0;
	N.rb *= -1.0;
	float d = diffuse(N, LIGHT);
	color.rgb *= mix(d, 1.0, .5);
	// color.rgb += (extra.rgb - 0.5) * 0.1;
	// color.rgb *= 1.25;
	vColor = color;


	// float g 	 = sin(extra.r + time * mix(extra.b, 1.0, .5));
	// g 			 = smoothstep(0.0, 1.0, g);
	// g 			 = mix(g, 1.0, .5);
	// vColor       = vec4(vec3(g), a);

	// vColor 			= texture2D(textureTest, uv);

	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset * (1.0 + extra.x * 1.0);

	vNormal 	 = aNormal;
}