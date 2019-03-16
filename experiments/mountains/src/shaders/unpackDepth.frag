// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
    float depth = dot(rgbaDepth, bitShift);
    return depth;
}


float UnpackDepth16( in vec2 pack )
{
    float depth = dot( pack, 1.0 / vec2(1.0, 256.0) );
    return depth * (256.0*256.0) / (256.0*256.0 - 1.0);
}


float UnpackDepth24( in vec3 pack )
{
  float depth = dot( pack, 1.0 / vec3(1.0, 256.0, 256.0*256.0) );
  return depth * (256.0*256.0*256.0) / (256.0*256.0*256.0 - 1.0);
}

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    // float d = unpackDepth(color);
    float d = UnpackDepth24(color.xyz);
    gl_FragColor = vec4(vec3(d), 1.0);
}