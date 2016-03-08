// render.vert

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform sampler2D texture;
uniform sampler2D textureExtra;
varying vec4 vColor;

void main(void) {
	vec2 uv      = aVertexPosition.xy;
	vec3 pos     = texture2D(texture, uv).rgb;
	vec3 extra   = texture2D(textureExtra, uv).rgb;
	gl_Position  = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	
	gl_PointSize = 1.0 + extra.r * 2.0;
	
	vColor 		= vec4(vec3(extra.b), 1.0);
}