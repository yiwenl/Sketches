// dots.vert
const int NUM = ${NUM};

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
// attribute vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 scale;
uniform vec2 uvOffset;
uniform float radius;
uniform float numSeg;
uniform float uMaxHeight;
uniform float uNoiseHeight;

uniform vec3 uWaveCenters[NUM];
uniform vec3 uWaves[NUM];

uniform sampler2D texture;
uniform sampler2D textureNoise;
uniform vec3 uPosition;
uniform vec2 uViewport;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;


const float PI = 3.141592657;
const float PI_2 = PI * 0.5;


float getWaveHeight(vec3 pos) {
    float h = 0.0;

    vec3 waveCenter;
    float distToWave;
    float distToWaveFront;
    float waveFront;
    float waveHeight;
    float waveLength;

    for(int i=0; i<NUM; i++) {
        waveCenter = uWaveCenters[i];
        distToWave = distance(waveCenter, pos);
        waveFront = uWaves[i].x;
        waveHeight = uWaves[i].y;
        waveLength = uWaves[i].z;

        distToWaveFront = distance(distToWave, waveFront);

        if(distToWaveFront < waveLength) {
            float tmp = 1.0 - distToWaveFront / waveLength;
            tmp = pow(sin(tmp * PI_2), 2.0);
            h += tmp * waveHeight;
        }

    }

    return h;
}

void main(void) {
	vec3 pos = (aVertexPosition + uPosition) * scale;
	vec2 uv = aTextureCoord /numSeg + uvOffset;
	vec3 mapColor = texture2D(texture, uv).rgb;
    float noiseHeight = texture2D(textureNoise, uv).r;
	pos.y = (mapColor.r + noiseHeight * uNoiseHeight) * uMaxHeight;
    float wh = getWaveHeight(pos);
    pos.y        += wh;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = uv;

    vNormal = aNormal;
    

    // const float radius = 0.0075;
    float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset * (1.0 + aVertexPosition.y * 1.0);
    distOffset = smoothstep(0.0, 0.5, distOffset);
    distOffset = mix(distOffset, 1.0, .5);
    vColor = mix(mapColor, vec3(1.0), 0.2) * distOffset + wh * 0.5;
}