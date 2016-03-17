precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texture;
uniform sampler2D textureNext;
uniform sampler2D textureExtra;
uniform sampler2D textureConstellation;
uniform float percent;
uniform float numSlides;
uniform vec2 uvOffset;

varying vec4 vColor;


float contrast(float value, float scale) {
	return .5 + (value - .5) * scale;
}

vec2 contrast(vec2 value, float scale) {
	return vec2(contrast(value.x, scale), contrast(value.y, scale));
}

void main(void) {
	vec2 uv 		= aVertexPosition.xy * numSlides + uvOffset;
	vec3 posCurr    = texture2D(texture, uv).rgb;
	vec3 posNext    = texture2D(textureNext, uv).rgb;
	vec3 pos        = mix(posCurr, posNext, percent);
	vec3 extra      = texture2D(textureExtra, uv).rgb;
	vec2 uvConstellation = contrast(uv, 0.75);
	vec4 color      = texture2D(textureConstellation, uvConstellation);
	float lengthColor = length(color.rgb * color.a);
	float z 		= 1.0 - lengthColor / length(vec3(1.0));
	pos.z 			= z * 0.5;
	
	vec4 mvPosition = uViewMatrix * uModelMatrix * vec4(pos, 1.0);
	gl_Position     = uProjectionMatrix * mvPosition;
	
	vColor          = color;
	// vColor          = vec4(vec3(extra.b), 1.0);
	gl_PointSize 	= 1.0;
}