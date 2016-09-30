// grassSimple.frag

#define SHADER_NAME GRASS_FRAGMENT

precision mediump float;

uniform sampler2D textureGrass;
varying vec2 vTextureCoord;
varying vec2 vUVNoise;
varying vec3 vColor;
varying vec3 vNormal;
varying float vHeight;

void main(void) {
	vec4 texel = texture2D(textureGrass, vTextureCoord);
	if(texel.a < 0.75) discard;
	// float g = smoothstep(-0.1, 0.5, vTextureCoord.y);
    gl_FragColor = texel;
    gl_FragColor.rgb *= mix(vColor, vec3(1.0), .5);
    // gl_FragColor.rgb = vec3(vHeight);
}