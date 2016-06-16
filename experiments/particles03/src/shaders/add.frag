// add.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureBlur;

const vec3 color0 = vec3(4.0, 4.0, 25.0)/255.0;
const vec3 color1 = vec3(255.0, 254.0, 246.0)/255.0;

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    vec4 colorBlur = texture2D(textureBlur, vTextureCoord);

    color.rgb += colorBlur.rgb;

    float br = length(color.rgb) / length(vec3(1.0));
    color.rgb = mix(color0, color1, br);

    gl_FragColor = color;
}