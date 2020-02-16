// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vExtra;
varying vec3 vDebug;
varying float vIndex;

uniform sampler2D texture;
uniform float uTime;
uniform float uIsInvert;

#define NUM 8.0
#define FOG_DENSITY 0.3

float fogFactorExp2(const float dist, const float density) {
	const float LOG2 = -1.442695;
	float d = density * dist;
	return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}


void main(void) {
    
    float index = floor(uTime * mix(vNormal.z, 1.0, .1) * 5.0) + vIndex;
    index = mod(index, 64.0);
    vec2 uv = vTextureCoord / NUM;
    float u = floor(index / NUM) / NUM;
    float v = mod(index, NUM) / NUM;
    uv += vec2(u, v);


    vec4 color = texture2D(texture, uv);
    if(color.a < 0.5) { discard; }
    

    float head = mod(uTime * 0.1 + vExtra.y, 1.0);

    float br = smoothstep(head - 0.2, head - 0.01, vNormal.x);
    if(vNormal.x > head) {
        br = 0.0;
    }

    br = mix(br, 1.0, 0.05);
    color *= br;
    if(uIsInvert > 0.5) {
        color.rgb = vec3(1.0) - color.rgb;
    }

    float fogDistance   = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount     = fogFactorExp2(fogDistance, FOG_DENSITY);
    
	vec4 fogColor = vec4(vec3(uIsInvert), 1.0);
	
	gl_FragColor        = mix(color, fogColor, fogAmount);
}