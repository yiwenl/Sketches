// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureAO;
uniform float uInvert;

const vec3 color0 = vec3(31.0/255.0, 34.0/255.0, 47.0/255.0);
const vec3 color1 = vec3(255.0/255.0, 247.0/255.0, 224.0/255.0);

const float maxBr = length(vec3(1.0));

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    vec3 colorInvert = vec3(1.0) - color.rgb;
    color.rgb = mix(color.rgb, colorInvert, uInvert);

    vec4 colorAO = texture2D(textureAO, vTextureCoord);
    colorAO = mix(colorAO, vec4(1.0), .25);
    color *= colorAO;


    float br = length(color.rgb) / maxBr;
    color.rgb = mix(color0, color1, br);

    gl_FragColor = color;
}