// render.vert

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform sampler2D textureLife;
uniform float percent;
uniform float time;
uniform float mid;
uniform float range;
uniform float particleAlpha;
uniform float waveFront;
uniform float waveLength;
uniform vec3 startPoint;
uniform vec3 color0;
uniform vec3 color1;

varying vec4 vColor;
varying vec3 vExtra;
varying vec4 vShadowCoord;

const mat4 biasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
							  0.0, 0.5, 0.0, 0.0,
							  0.0, 0.0, 0.5, 0.0,
							  0.5, 0.5, 0.5, 1.0 );

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
	gl_PointSize = d * 5.0 * (.5 + extra.r * 1.5) + 1.0;


	float distToStart = distance(pos, startPoint) + pow(extra.b, 2.0);
	float distToWaveFront = distance(distToStart, waveFront);
	float mixOffset = 0.0;

	if(distToWaveFront < waveLength) {
		mixOffset = smoothstep(0.0, 1.0, 1.0 - distToWaveFront / waveLength);
	}
	if(distToWaveFront < waveFront) {
		mixOffset = 1.0;
	}

	vec3 colorOffset = mix(color0, color1, mixOffset);
	colorOffset = mix(colorOffset, extra, .3);

	vColor       = vec4(vec3(mix(d, 1.0, .8)) * colorOffset, opacity * particleAlpha);
	vExtra 		 = extra;

	vShadowCoord    = ( biasMatrix * uShadowMatrix ) * vec4(pos, 1.0);;
}