// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;
uniform sampler2D textureMap;
uniform float uBias;

void main(void) {
	vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
	
	vec2 uv = shadowCoord.xy;
    float d = texture2D(textureDepth, uv).r;

    float visibility = 1.0;
    if(d < shadowCoord.z - uBias) {
    	visibility = 0.0;
    }

    vec3 baseColor = vec3(.5);
    vec3 colorMap = texture2D(textureMap, uv).rgb;

    vec3 color = mix(baseColor, colorMap, visibility);

    gl_FragColor = vec4(vec3(visibility), 1.0);
    gl_FragColor = vec4(color, 1.0);
}