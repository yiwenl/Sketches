// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vWsPosition;

uniform sampler2D texture;
uniform vec3 uHit;
uniform vec3 uLightPos;
uniform float uHitRadius;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main(void) {
	float d = distance(vWsPosition.rgb, uHit);
	if(d < uHitRadius) {
		discard;
	}

    vec4 color = texture2D(texture, vTextureCoord);

    float diff = diffuse(vNormal, uLightPos);
    diff = mix(diff, 1.0, .5) + 0.5;

    color.rgb *= diff;

    gl_FragColor = color;

}