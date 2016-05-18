// sky.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uGlobalTime;
varying vec3 vPosition;
varying vec3 vOrgPosition;

void main(void) {
	if(vOrgPosition.y <0.0) discard;
	vec2 uv = vTextureCoord + vec2(uGlobalTime*0.2, 0.0);
	uv.x = mod(uv.x, 1.0);
    gl_FragColor = texture2D(texture, uv);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}