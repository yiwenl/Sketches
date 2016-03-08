// ssao2.frag


#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureDepth;

uniform vec2 resolution;
uniform float time;


//------------------------------------------
//general stuff

//make sure that these two values are the same for your camera, otherwise distances will be wrong.

float znear = 0.1; //Z-near
float zfar = 100.0; //Z-far

//user variables
int samples = 16; //ao sample count

float radius = 3.0; //ao radius
float aoclamp = 0.25; //depth clamp - reduces haloing at screen edges
bool noise = true; //use noise instead of pattern for sample dithering
float noiseamount = 0.0002; //dithering amount

float diffarea = 0.4; //self-shadowing reduction
float gdisplace = 0.4; //gauss bell center

bool mist = true; //use mist?
float miststart = 0.0; //mist start
float mistend = 16.0; //mist end

bool onlyAO = false; //use only ambient occlusion pass?
float lumInfluence = 0.7; //how much luminance affects occlusion

//--------------------------------------------------------

vec2 rand(vec2 coord) //generating noise/pattern texture for dithering
{
	float noiseX = ((fract(1.0-coord.s*(resolution.x/2.0))*0.25)+(fract(coord.t*(resolution.y/2.0))*0.75))*2.0-1.0;
	float noiseY = ((fract(1.0-coord.s*(resolution.x/2.0))*0.75)+(fract(coord.t*(resolution.y/2.0))*0.25))*2.0-1.0;
	
	if (noise)
	{
		noiseX = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453),0.0,1.0)*2.0-1.0;
		noiseY = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453),0.0,1.0)*2.0-1.0;
	}
	return vec2(noiseX,noiseY)*noiseamount;
}


float doMist()
{
	float zdepth = texture2D(textureDepth,vTextureCoord.xy).x;
	float depth = -zfar * znear / (zdepth * (zfar - znear) - zfar);
	return clamp((depth-miststart)/mistend,0.0,1.0);
}

float readDepth(in vec2 coord) 
{
	if (vTextureCoord.x<0.0||vTextureCoord.y<0.0) return 1.0;
	return (2.0 * znear) / (zfar + znear - texture2D(textureDepth, coord ).x * (zfar-znear));
}


float compareDepths(in float depth1, in float depth2,inout int far)
{   
	float garea = 2.0; //gauss bell width    
	float diff = (depth1 - depth2)*100.0; //depth difference (0-100)
	//reduce left bell width to avoid self-shadowing 
	if (diff<gdisplace)
	{
	garea = diffarea;
	}else{
	far = 1;
	}
	
	float gauss = pow(2.7182,-2.0*(diff-gdisplace)*(diff-gdisplace)/(garea*garea));
	return gauss;
}  

float calAO(float depth,float dw, float dh)
{   
	float dd = (1.0-depth)*radius;
	
	float temp = 0.0;
	float temp2 = 0.0;
	float coordw = vTextureCoord.x + dw*dd;
	float coordh = vTextureCoord.y + dh*dd;
	float coordw2 = vTextureCoord.x - dw*dd;
	float coordh2 = vTextureCoord.y - dh*dd;
	
	vec2 coord = vec2(coordw , coordh);
	vec2 coord2 = vec2(coordw2, coordh2);
	
	int far = 0;
	temp = compareDepths(depth, readDepth(coord),far);
	//DEPTH EXTRAPOLATION:
	if (far > 0)
	{
		temp2 = compareDepths(readDepth(coord2),depth,far);
		temp += (1.0-temp)*temp2;
	}
	
	return temp;
} 


void main(void) {
    gl_FragColor = texture2D(texture, vTextureCoord) * 1.0;
}