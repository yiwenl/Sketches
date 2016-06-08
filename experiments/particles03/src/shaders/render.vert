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
uniform vec2 uViewport;
uniform float percent;
uniform float time;
varying vec4 vColor;
varying vec3 vNormal;

const float radius = 0.05;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	gl_PointSize = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
	

	// float g 	 = sin(extra.r + time * mix(extra.b, 1.0, .5));
	// g 			 = smoothstep(0.0, 1.0, g);
	// g 			 = mix(g, 1.0, .5);

	float g  	 = mix(extra.b, 1.0, 0.75);
	vColor       = vec4(vec3(g), 1.0);

	// gl_PointSize = 1.0;

	vNormal 	 = aNormal;
}