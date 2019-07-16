// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uFadeRange;
uniform float uRatio;
uniform float uOpacity;
uniform float uOffset;

uniform float uRadius;
uniform float uDistance;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

#define PI 3.141592653
#pragma glslify: easing = require(./fragments/easings/cubic-in.glsl)
#pragma glslify: easingBr = require(./fragments/easings/cubic-in.glsl)


// #define uDistance 1.05

void main(void) {
	// vec2 uTouch      = vec2(0.4324, 1.0 - 0.5765);
	vec2 uTouch      = vec2(0.5);
	vec2 uv          = vTextureCoord - uTouch;
	uv.y             /= uRatio;
	vec2 diff        = uv;
	float rad        = length(uv);
	float deform     = 1.0 / pow(rad * pow(uDistance, 0.5), 2.0) * uRadius * 0.1;
	uv               = uv * ( 1.0 - deform);
	
	
	float offsetRot  = smoothstep(uRadius * 1.25, 0.0, rad);
	offsetRot 		 = sin(offsetRot * PI);
	float theta      = -offsetRot * PI * 4.0 * uOffset;
	uv               = rotate(uv, theta);
	
	uv.y             *= uRatio;
	uv               += uTouch;
	
	vec4 color       = texture2D(texture, uv);
	float t          = rad * uDistance;
	color.rgb        *= smoothstep(uRadius * 0.8, uRadius, t);
	
	float d          = smoothstep(0.2, 0.2 + uFadeRange, length(diff)) + 0.1;
	d                = mix(1.0, d, uOffset);

	float br = smoothstep(0.25, 1.0, uOffset);
	br = easingBr(br);
	float opacityAdd = 0.25 * ( 1.0 - br);
	
	color.rgb        *= d * uOpacity + opacityAdd;
	
	gl_FragColor     = color;
	// gl_FragColor     = vec4(vec3(offsetRot), 1.0);
	// gl_FragColor     = vec4(vec3(opacityAdd), 1.0);
}