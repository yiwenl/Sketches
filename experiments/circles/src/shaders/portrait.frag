// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uRatio;
uniform float numPie;
uniform float numRings;

const vec2 center = vec2(.5);
const float PI = 3.141592653;


void main(void) {

	vec2 uvRelative = vTextureCoord - center;
	float theta = atan(uvRelative.y, uvRelative.x);

	vec3 color = vec3(0.0);
	float t = floor(theta * numPie) / numPie;

	float d = length(uvRelative) / length(vec2(.5));
	d = floor(d * numRings) / numRings;

	float u = cos(t) * d;
	float v = sin(t) * d;
	vec2 uv = vec2(u,v) * .5 + .5;

	vec3 colorMap = texture2D(texture, uv).rgb;
	float g = dot(colorMap, vec3(0.299, 0.587, 0.114));
	color = vec3(g);


    gl_FragColor = texture2D(texture, vTextureCoord);
    gl_FragColor = vec4(color, 1.0);
}