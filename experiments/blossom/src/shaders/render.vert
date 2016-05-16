// render.vert

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform sampler2D textureLife;
uniform float percent;
uniform float time;
uniform float mid;
uniform float range;

varying vec4 vColor;
varying vec3 vExtra;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 posCurr = texture2D(textureCurr, uv).rgb;
	vec3 posNext = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(posCurr, posNext, percent);
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	float life   = texture2D(textureLife, uv).r;
	vec4 V  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	gl_Position = V;
	
	float d      = V.z/V.w;

	d = 1.0-smoothstep(mid-range, mid+range, d);

	
	
	float opacity;
	if(life > .5) {
		opacity = 1.0-smoothstep(0.95, 1.0, life);
	} else {
		opacity = smoothstep(0.1, 0.2, life);
	}

	d *= opacity;
	// gl_PointSize = d * 2.0 * (.5 + extra.r * 1.5);
	gl_PointSize = 1.0;

	vColor       = vec4(vec3(mix(d, 1.0, .8)), opacity);
	vExtra 		 = extra;
}