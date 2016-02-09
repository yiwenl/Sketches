// ssao.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;
uniform sampler2D textureDepth;


float nrand( vec2 n )
{
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}


float nrand(float x, float y) {
	return nrand(vec2(x, y));
}


vec2 camerarange = vec2(1.0, 1024.0);

float readDepth(in vec2 coord)   {  
	if (coord.x<0.0||coord.y<0.0) return 1.0;
	float nearZ = camerarange.x;  
	float farZ = camerarange.y;  
	float posZ = texture2D(textureDepth, coord).x;   
	return (2.0 * nearZ) / (nearZ + farZ - posZ * (farZ - nearZ));  
}   


float compareDepths(in float depth1, in float depth2,inout int far)  {  

	float diff = (depth1 - depth2)*100.0; //depth difference (0-100)
	float gdisplace = 0.2; //gauss bell center
	float garea = 2.0; //gauss bell width 2

	//reduce left bell width to avoid self-shadowing
	if (diff<gdisplace){ 
		garea = 0.1;
	}else{
		far = 1;
	}
	float gauss = pow(2.7182,-2.0*(diff-gdisplace)*(diff-gdisplace)/(garea*garea));

	return gauss;
}


float calAO(float depth,float dw, float dh)  {  
	float temp = 0.0;
	float temp2 = 0.0;
	float coordw = vTextureCoord.x + dw/depth;
	float coordh = vTextureCoord.y + dh/depth;
	float coordw2 = vTextureCoord.x - dw/depth;
	float coordh2 = vTextureCoord.y - dh/depth;

	if (coordw  < 1.0 && coordw  > 0.0 && coordh < 1.0 && coordh  > 0.0){
		vec2 coord = vec2(coordw , coordh);
		vec2 coord2 = vec2(coordw2, coordh2);
		int far = 0;
		temp = compareDepths(depth, readDepth(coord),far);

		//DEPTH EXTRAPOLATION:
		if (far > 0){
			temp2 = compareDepths(readDepth(coord2),depth,far);
			temp += (1.0-temp)*temp2; 
		}
	}

	return temp;  
} 




void main(void) {
	float range = 1.0;
	float pw = range/resolution.x*0.5;    
	float ph = range/resolution.y*0.5;  
	float r = 100.0;
	vec2 fres = vec2(r,r);
	// vec3 random = vec3(nrand(vTextureCoord.x, time), nrand(vTextureCoord.y, time), nrand(vTextureCoord.yx+vec2(time)));
	vec3 random = vec3(nrand(vTextureCoord.xx+time), nrand(vTextureCoord.yy+time), nrand(vTextureCoord.yx+vec2(time)));
	random = random*2.0-vec3(1.0);

	//initialize stuff:
	float depth = readDepth(vTextureCoord);
	float ao = 0.0;
	float samplingScaling = 1.17;
	float randomScaling = 0.007;

	for(int i=0; i<4; ++i) 
	{  
		//calculate color bleeding and ao:
		ao+=calAO(depth,  pw, ph);  
		ao+=calAO(depth,  pw, -ph);  
		ao+=calAO(depth,  -pw, ph);  
		ao+=calAO(depth,  -pw, -ph);

		ao+=calAO(depth,  pw*1.2, 0.0);  
		ao+=calAO(depth,  -pw*1.2, 0.0);  
		ao+=calAO(depth,  0.0, ph*1.2);  
		ao+=calAO(depth,  0.0, -ph*1.2);

		//sample jittering:
		pw += random.x*randomScaling;
		ph += random.y*randomScaling;

		//increase sampling area:
		pw *= samplingScaling;  
		ph *= samplingScaling;    
	}         

	//final values, some adjusting:
	float finalAO = 1.0-(ao/32.0);
	finalAO = smoothstep(.8, 1.0, finalAO);
	// finalAO = mix(finalAO, 1.0, .7);
	vec4 color = texture2D(texture, vTextureCoord);
	color.rgb *= finalAO;
	color.rgb = vec3(finalAO);

	// gl_FragColor = vec4(0.3+finalAO*0.7,1.0);  
	// gl_FragColor.rgb *= color;
    gl_FragColor = color;
}