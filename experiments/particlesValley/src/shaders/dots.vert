// dots.vert

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
uniform sampler2D texture;
uniform sampler2D textureNormal;
uniform vec3 uPosition;
uniform vec2 uViewport;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vColor;

void main(void) {
	vec3 pos = (aVertexPosition + uPosition) * scale;
	vec2 uv = aTextureCoord /numSeg + uvOffset;
	vec3 mapColor = texture2D(texture, uv).rgb;
	pos.y = mapColor.r * .25;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = uv;

    vNormal = aNormal;
    vNormal = uNormalMatrix * texture2D(textureNormal, uv).rgb;
    vColor = mix(mapColor, vec3(1.0), .1);

    // const float radius = 0.0075;
    gl_PointSize = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w * (1.0 + aVertexPosition.y * 3.0);
}