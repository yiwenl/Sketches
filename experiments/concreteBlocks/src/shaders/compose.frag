// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uTex;
uniform sampler2D uTexAO;
uniform float uAOStrength;

void main(void) {
    float ao = texture2D(uTexAO, vTextureCoord).r;
    vec4 color = texture2D(uTex, vTextureCoord);
    ao = mix(1.0, ao, uAOStrength);

    color.rgb *= ao;
    gl_FragColor = color;
    // gl_FragColor = vec4(vec3(ao), 1.0);
}