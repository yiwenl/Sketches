// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureAO;
uniform float uInvert;
uniform float uOffset;

const vec3 color0 = vec3(31.0/255.0, 34.0/255.0, 47.0/255.0);
const vec3 color1 = vec3(255.0/255.0, 247.0/255.0, 224.0/255.0);

const float maxBr = length(vec3(1.0));

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    vec4 colorAO = texture2D(textureAO, vTextureCoord);
    // colorAO = mix(colorAO, vec4(1.0), .25);
    // vec4 colorFinal = mix(color, color * colorAO, uOffset);
    vec4 colorFinal = color * colorAO;

    gl_FragColor = colorFinal;
    // gl_FragColor = colorAO;
}