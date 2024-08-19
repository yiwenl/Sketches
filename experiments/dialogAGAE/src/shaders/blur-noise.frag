#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;

uint Rand(uint x) {
    x ^= x >> 16;
    x *= 0x7feb352dU;
    x ^= x >> 15;
    x *= 0x846ca68bU;
    x ^= x >> 16;
    return x;
}

uint HilbertIndex(uvec2 p) {
    uint i = 0u;
    for(uint l = 0x4000u; l > 0u; l >>= 1u) {
        uvec2 r = min(p & l, 1u);
        
        i = (i << 2u) | ((r.x * 3u) ^ r.y);       
        p = r.y == 0u ? (0x7FFFu * r.x) ^ p.yx : p;
    }
    return i;
}

uint ReverseBits(uint x) {
    x = ((x & 0xaaaaaaaau) >> 1) | ((x & 0x55555555u) << 1);
    x = ((x & 0xccccccccu) >> 2) | ((x & 0x33333333u) << 2);
    x = ((x & 0xf0f0f0f0u) >> 4) | ((x & 0x0f0f0f0fu) << 4);
    x = ((x & 0xff00ff00u) >> 8) | ((x & 0x00ff00ffu) << 8);
    return (x >> 16) | (x << 16);
}

// from: https://psychopath.io/post/2021_01_30_building_a_better_lk_hash
uint OwenHash(uint x, uint seed) { // seed is any random number
    x ^= x * 0x3d20adeau;
    x += seed;
    x *= (seed >> 16) | 1u;
    x ^= x * 0x05526c56u;
    x ^= x * 0x53a22864u;
    return x;
}

// adapted from: https://www.shadertoy.com/view/MslGR8
float ReshapeUniformToTriangle(float v) {
    v = v * 2.0 - 1.0;
    v = sign(v) * (1.0 - sqrt(max(0.0, 1.0 - abs(v)))); // [-1, 1], max prevents NaNs
    return v + 0.5; // [-0.5, 1.5]
}

void main() {
    float scale = 10.0;
    uint m = HilbertIndex(uvec2(uResolution * vTextureCoord * scale));     // map pixel coords to hilbert curve index
    m = OwenHash(ReverseBits(m), 0xe7843fbfu);   // owen-scramble hilbert index
    m = OwenHash(ReverseBits(m), 0x8d8fb1e0u);   // map hilbert index to sobol sequence and owen-scramble
    float mask = float(ReverseBits(m)) / 4294967296.0; // convert to float

    outColor = vec4(vec3(mask), 1.0);
}
