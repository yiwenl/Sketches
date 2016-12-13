// save.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;
attribute vec3 aExtra;
attribute vec2 aUV;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 viewProjectionInverseMatrix;
uniform mat4 invertView;
uniform mat4 invertProjection;

uniform vec3 uCamPos;

uniform sampler2D texture;
uniform sampler2D textureMap;
uniform sampler2D textureDepth;

varying vec2 vTextureCoord;
varying vec3 vColor;
varying vec4 vPointColor;
varying vec3 vNormal;
varying vec3 vExtra;


vec3 decodeLocation() {
	vec4 clipSpaceLocation;
	clipSpaceLocation.xy = aUV * 2.0 - 1.0;
	clipSpaceLocation.z = texture2D(textureDepth, aUV).r * 2.0 - 1.0;
	clipSpaceLocation.w = 1.0;

	vec4 viewSpacePosition = invertProjection * clipSpaceLocation;
	viewSpacePosition /= viewSpacePosition.w;

    vec4 worldSpacePosition = invertView * viewSpacePosition;
    return worldSpacePosition.xyz;
	
}

void main(void) {
	float radius     = length(uCamPos);
	vec3 posParticle = aVertexPosition;
	posParticle      = decodeLocation();
	float distToCam  = distance(posParticle, uCamPos);

	float offset 	 = step(distToCam, radius * 1.1);

	vec3 dirToCam 	 = normalize(uCamPos - posParticle);
	posParticle 	 += dirToCam * 0.02;

	vColor           = posParticle;
	
	
	vec3 pos         = vec3(aTextureCoord, 0.0);
	gl_Position      = vec4(pos, 1.0);
	
	vNormal          = aNormal;
	vExtra           = aExtra;

	vec4 colorPoint  = texture2D(textureMap, aUV);
	vPointColor      = colorPoint * offset;
}