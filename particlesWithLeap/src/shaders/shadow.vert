// shadow.vert

// render.vert

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D texture;
uniform sampler2D textureNext;
uniform float percent;
varying vec4 vColor;

varying vec4 vShadowCoord;
varying vec4 vPosition;

const mat4 biasMatrix = mat4( 0.5, 0.0, 0.0, 0.0,
							  0.0, 0.5, 0.0, 0.0,
							  0.0, 0.0, 0.5, 0.0,
							  0.5, 0.5, 0.5, 1.0 );

void main(void) {
	vec2 uv      = aVertexPosition.xy * .5;
	vec3 currPos = texture2D(texture, uv).rgb;
	vec3 nextPos = texture2D(textureNext, uv).rgb;
	vec3 pos     = mix(currPos, nextPos, percent);

	vec4 mvPosition = uViewMatrix * uModelMatrix * vec4(pos, 1.0);

	gl_Position     = uProjectionMatrix * mvPosition;
	vPosition       = mvPosition;
	vShadowCoord    = ( biasMatrix * uShadowMatrix ) * vec4(pos, 1.0);;
	
	float d      = length(pos);
	float a      = smoothstep(3.0, 4.5, d);
	vColor       = vec4(1.0, 1.0, 1.0, 1.0);

	gl_PointSize = 2.0;

	if(length(currPos) - length(nextPos) > 1.0) vColor.a = 0.0;
}