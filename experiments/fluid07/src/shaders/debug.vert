// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D texturePos;
uniform sampler2D textureData;
varying vec3 vNormal;
varying vec3 vColor;

void main(void) {
    vec3 pos = texture2D(texturePos, aTextureCoord).xyz;
    vec3 data = texture2D(textureData, aTextureCoord).xyz;
    float life = data.x;
    float scale = data.y;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    vNormal = aNormal;

    gl_PointSize = (2.0 + aVertexPosition.x * 2.0) * scale;

    float g = abs(life - 0.5) / 0.5;
    // g = smoothstep(0.5, 0.4, g);

    vColor = vec3(scale);
}