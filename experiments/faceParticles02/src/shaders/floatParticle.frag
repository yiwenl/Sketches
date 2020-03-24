// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

#define FOG_DENSITY 0.2


float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

void main(void) {

    if(distance(gl_PointCoord, vec2(.5)) > .5) {
        discard;
    }

    vec4 color = vec4(vec3(1.0), 0.7);
    float fogDistance   = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount     = fogFactorExp2(fogDistance - 7.5, FOG_DENSITY);
	const vec4 fogColor = vec4(0.0, 0.0, 0.0, 1.0); // white
    gl_FragColor        = mix(color, fogColor, fogAmount);
	gl_FragColor.rgb *= 1.5;
}