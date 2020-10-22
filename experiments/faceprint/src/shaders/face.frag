// copy.frag

#extension GL_OES_standard_derivatives : enable
#extension GL_EXT_draw_buffers : require 

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
uniform sampler2D texture;


vec3 getNormal(vec3 vPos) {
    vec3 dFdxPos = dFdx( vPos );
	vec3 dFdyPos = dFdy( vPos );
    
    vec3 N = normalize(cross(dFdxPos,dFdyPos)); 

    return N;
}

#pragma glslify: diffuse    = require(glsl-utils/diffuse.glsl)

#define LIGHT vec3(1.0, 0.5, 0.5)

void main(void) {
    vec3 n = getNormal(vPosition);
    float g = diffuse(n, LIGHT, 1.0);
    
    gl_FragData[0] = vec4(vPosition, 1.0);
    gl_FragData[1] = vec4(vec3(g), 1.0);
}