// render.vert

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform float percent;
uniform float mid;
uniform float range;
uniform float opacity;

varying vec4 vColor;
varying vec3 vExtra;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	vec4 V  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	gl_Position = V;
	
	float d      = V.z/V.w;

	d = 1.0-smoothstep(mid-range, mid+range, d);
	gl_PointSize = d * 5.0 * (.5 + extra.r * 1.5);
	float alpha = 1.0;

	if(posNext.x < posCurr.x) {
		alpha = 0.0;
	}

	vec3 color = vec3(mix(extra.r, 1.0, 0.75));

	vColor       = vec4(color, opacity * alpha);
}