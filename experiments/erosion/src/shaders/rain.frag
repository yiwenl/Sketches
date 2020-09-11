// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

uniform float uRainDegree;

void main(void) {
    vec4 cur = texture2D(texture, vTextureCoord);

    float pi = uRainDegree;

    gl_FragColor = vec4(cur.x, cur.y+pi, cur.z, cur.w);
}