// threshold.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float threshold;

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    float br = length(color.rgb) / length(vec3(1.0));

    if(br < threshold) color.rgb = vec3(0.0);

    gl_FragColor = color;
    // gl_FragColor = texture2D(texture, vTextureCoord);
}