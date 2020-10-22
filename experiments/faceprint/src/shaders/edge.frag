// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uWidth;

void main(void) {

    vec2 uv = vTextureCoord;
    float gap = 0.01 * uWidth;

    float pLeft = texture2D(texture, uv + vec2(-gap, 0.0)).a;
    float pRight = texture2D(texture, uv + vec2(gap, 0.0)).a;
    float pTop = texture2D(texture, uv + vec2(0.0, gap)).a;
    float pBottom = texture2D(texture, uv + vec2(0.0, -gap)).a;

    float dx = abs(pLeft - pRight);
    float dy = abs(pTop - pBottom);

    gl_FragColor = vec4(vec3(dx + dy), 1.0);
}