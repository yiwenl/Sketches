// render.vert

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texture;
uniform sampler2D textureNext;
uniform float percent;
varying vec4 vColor;

void main(void) {
	vec2 uv      = aVertexPosition.xy * .5;
	vec3 currPos = texture2D(texture, uv).rgb;
	vec3 nextPos = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(currPos, nextPos, percent);
	vec4 V       = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	gl_Position  = V;
	gl_PointSize = 2.0;

	float d 	 = V.z/V.w;
	d 			 = d*.5 + .5;
	vColor       = vec4(d, d, d, 1.0);

	if(length(currPos) - length(nextPos) > 1.0) vColor.a = 0.0;
}