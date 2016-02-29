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
	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	gl_PointSize = 1.0;
	
	float d      = length(pos);
	float a      = smoothstep(3.0, 4.5, d);
	vColor       = vec4(1.0, 0.0, 0.0, 1.0-a);

	if(length(currPos) - length(nextPos) > 1.0) vColor.a = 0.0;
}