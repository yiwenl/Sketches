// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform sampler2D textureChar;
uniform sampler2D textureCurr;
uniform sampler2D texturePrev;
uniform sampler2D textureNoise;
uniform float uOffset;

void main(void) {
    vec2 uv = gl_PointCoord;
    uv.y = 1.0 - uv.y;
    uv =  uv/ 12.0 + vTextureCoord;
    vec4 char = texture2D(textureChar, uv);
    vec4 curr = texture2D(textureCurr, vNormal.zy);
    vec4 prev = texture2D(texturePrev, vNormal.zy);
    vec4 color = mix(prev, curr, uOffset);

    uv = gl_PointCoord * 0.75 + vNormal.yx * 0.25;
    float noise = texture2D(textureNoise, uv).r;

    noise = smoothstep(0.1, 0.7, noise);
    char.rgb *= noise;

    gl_FragColor = char * color;
}