// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureMap;
uniform samplerCube uCubeMap;
uniform float uStrength;

void main(void) {
	vec2 uv = vTextureCoord;
	vec4 noise = texture2D(textureMap, vTextureCoord);
	uv += (noise.xy - 0.5) * noise.a * uStrength;
    vec4 color = texture2D(texture, uv);

    vec3 N = normalize(noise.rgb * 2.0 - 1.0);
    vec3 envLight = pow( textureCube( uCubeMap, N ).rgb, vec3( 3 ) );

    color.rgb += envLight * 0.35;

    gl_FragColor = color;
}