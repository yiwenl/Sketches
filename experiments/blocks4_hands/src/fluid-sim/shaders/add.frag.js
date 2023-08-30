module.exports = `precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureBase;
uniform sampler2D textureAdd;
uniform float uStrength;

void main(void) {
    vec3 base = texture2D(textureBase, vTextureCoord).xyz;
    vec3 add = texture2D(textureAdd, vTextureCoord).xyz;
    gl_FragColor = vec4(base + add * uStrength, 1.0);
}`;
