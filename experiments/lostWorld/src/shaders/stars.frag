// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;

uniform sampler2D texture;
uniform float elevation;
uniform vec3 fogColor;

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);

    float t = smoothstep(elevation * 4.0, 0.0, abs(vPosition.y));
	t = pow(t, 3.0);
	color.rgb = mix(color.rgb, fogColor, t);

    gl_FragColor = color;
}