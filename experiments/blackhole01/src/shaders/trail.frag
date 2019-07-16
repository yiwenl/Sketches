precision highp float;
varying vec2 vTextureCoord;
varying vec3 vDebug;
varying vec3 vExtra;
varying vec3 vWsPosition;
varying vec4 vScreenPosition;
varying float vAlpha;
varying float vDirection;

uniform vec3 uColor;
uniform sampler2D textureBg1;
uniform sampler2D textureBg2;
uniform float uOpacity;
uniform float uOffsetFadeOut;

#pragma glslify: easing = require(./fragments/easings/exponential-in.glsl)

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

#define AXIS_X vec3(1.0, 0.0, 0.0)

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


#define LIGHT vec3(0.0, 1.0, 7.0)
#define PI 3.141592653

void main(void) {
	if(vAlpha <= 0.01) {
		discard;
	}

	float distToCenter = length(vWsPosition.xy);
	float opacity0     = smoothstep(0.75, 2.0, distToCenter);

	float opacity1     = smoothstep(6.0+uOffsetFadeOut, 4.5+uOffsetFadeOut, distToCenter);
	float zThreshold   = -3.5;
	float opacityZ 	   = smoothstep(zThreshold-0.5, zThreshold, vWsPosition.z);
	float opacity      = opacity0 * opacity1 * opacityZ;

	if(opacity <= 0.01) {
		discard;
	}


	vec2 uvScreen    = vScreenPosition.xy / vScreenPosition.w * .5 + .5;	
	float start      = 2.5 + (vExtra.b - 0.5) * 1.0;
	float leng       = (1.0 + (vExtra.r - 0.5) * 1.5) * 2.0;
	float p          = smoothstep(start, start + leng, distToCenter);
	uvScreen = (uvScreen - vec2(.5)) * 0.8 + vec2(.5);
	uvScreen.x       = abs(uvScreen.x - 0.5) + 0.5;
	uvScreen 		 += (vExtra.gb - 0.5) * 0.4;
	vec4 color1      = texture2D(textureBg1, uvScreen);
	vec4 color2      = texture2D(textureBg2, uvScreen);
	vec3 color       = mix(color2.rgb, color1.rgb, p);
	
	opacity          = easing(opacity);
	float brightness = 1.0;
	brightness 		 *= mix(vExtra.g, 1.0, .5);
	color            *= brightness;
	
	vec3 N           = vec3(0.0, 0.0, 1.0);
	float theta      = vTextureCoord.y - 0.5;
	N                = rotate(normalize(N), AXIS_X, theta * PI);
	N.xy 		   	 = rotate(N.xy, vDirection);
	float d          = diffuse(N, LIGHT);
	d                = mix(d, 1.0, .8);

	float opacityOpening = smoothstep(0.0, 0.25, uOpacity);
    gl_FragColor = vec4(color * d, vAlpha * opacity * opacityOpening	);
}