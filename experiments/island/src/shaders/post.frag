// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureMap;

const vec3 color0 = vec3(19.0, 18.0, 11.0)/255.0;
const vec3 color1 = vec3(239.0, 240.0, 235.0)/255.0;
uniform float offset;

void main(void) {
	vec4 color = texture2D(texture, vTextureCoord);
	vec3 colorMap = texture2D(textureMap, vTextureCoord).rgb;

	// color.r += colorMap.r;

	// if(colorMap.r > .5 && color.r >= 0.9) {
	// 	color.rgb = vec3(1.0) - color.rgb;
	// }

	if(color.r >= 0.9 && color.g < 0.01) {
		if(colorMap.r > .5) {
			color.rgb = vec3(1.0);
		} else {
			color.rgb = vec3(0.1);
		}
	}


	float br = length(color.rgb) / length(vec3(1.0));
	color.rgb = mix(color0, color1, br);

	vec3 invert = vec3(1.0) - color.rgb;

	color.rgb = mix(color.rgb, invert, offset);

    gl_FragColor = color;
}