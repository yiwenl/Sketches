// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vVertex;
uniform samplerCube texture;
uniform vec3 uColor;

  
vec3 blendOverlay(vec3 base, vec3 blend) {
    return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
    // with conditionals, may be worth benchmarking
    // return vec3(
    //     base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
    //     base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
    //     base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
    // );
}

void main(void) {
    vec4 color = textureCube(texture, vVertex);
    // vec3 colorOrg = vec3(color.rgb);
    // color.rgb *= uColor * 0.75;
    color.rgb = blendOverlay(color.rgb, uColor);

    color.rgb = pow(color.rgb, vec3(1.0/2.2)) * 0.5;

    gl_FragColor = color;
}