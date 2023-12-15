module.exports = `precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureBase;
uniform sampler2D textureAdd;
uniform float uStrength;

uniform float uDensity;

vec2 _normalize(vec2 v) {   
    if(length(v) == 0.0) {
        return vec2(0.0);
    } else {
        return normalize(v);    
    }
}

void main(void) {
    vec3 base = texture2D(textureBase, vTextureCoord).xyz;
    vec3 add = texture2D(textureAdd, vTextureCoord).xyz;

    if(uDensity > 0.5) {
        base += add.zzz * uStrength;
    } else {
        // base.xy += _normalize(add.xy) * uStrength;
        base.xy += add.xy * uStrength;
    }

    gl_FragColor = vec4(base, 1.0);
}`;
