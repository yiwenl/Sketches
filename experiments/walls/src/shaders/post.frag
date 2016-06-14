// post.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureSSAO;
uniform vec2 resolution;
uniform float time;


const float PI = 3.141592657;



float linterp( float t ) {
	return clamp( 1.0 - abs( 2.0*t - 1.0 ), 0.0, 1.0 );
}

float remap( float t, float a, float b ) {
	return clamp( (t - a) / (b - a), 0.0, 1.0 );
}
vec2 remap( vec2 t, vec2 a, vec2 b ) {
	return clamp( (t - a) / (b - a), 0.0, 1.0 );
}

vec3 spectrum_offset_rgb( float t ) {
	vec3 ret;
	float lo = step(t,0.5);
	float hi = 1.0-lo;
	float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
	ret = vec3(lo,1.0,hi) * vec3(1.0-w, w, 1.0-w);

	return pow( ret, vec3(1.0/2.2) );
}

const float gamma = 2.2;
vec3 lin2srgb( vec3 c )
{
    return pow( c, vec3(gamma) );
}
vec3 srgb2lin( vec3 c )
{
    return pow( c, vec3(1.0/gamma));
}


vec2 barrelDistortion( vec2 p, vec2 amt )
{
    p = 2.0 * p - 1.0;

    const float maxBarrelPower = sqrt(5.0);
    float radius = dot(p,p); //faster but doesn't match above accurately
    p *= pow(vec2(radius), maxBarrelPower * amt);
	/* */

    return p * 0.5 + 0.5;
}

vec2 brownConradyDistortion(vec2 uv, float dist)
{
    uv = uv * 2.0 - 1.0;
    float barrelDistortion1 = 0.1 * dist; // K1 in text books
    float barrelDistortion2 = -0.025 * dist; // K2 in text books

    float r2 = dot(uv,uv);
    uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;
    return uv * 0.5 + 0.5;
}

vec2 distort( vec2 uv, float t, vec2 min_distort, vec2 max_distort )
{
    vec2 dist = mix( min_distort, max_distort, t );
    return brownConradyDistortion( uv, 75.0 * dist.x );
}

// ====

vec3 spectrum_offset( float t )
{
    return spectrum_offset_rgb( t );
}

// ====

float nrand( vec2 n )
{
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}


void main(void) {
	vec2 uv                 = vTextureCoord;
	
	const float MAX_DIST_PX = 20.0;
	float max_distort_px    = MAX_DIST_PX * .5;
	vec2 max_distort        = vec2(max_distort_px) / resolution.xy;
	vec2 min_distort        = 0.5 * max_distort;
	
	vec2 oversiz            = distort( vec2(1.0), 1.0, min_distort, max_distort );
	uv                      = remap( uv, 1.0-oversiz, oversiz );
	
	vec3 sumcol             = vec3(0.0);
	vec3 sumw               = vec3(0.0);
	float rnd               = nrand( uv + fract(time) );
    const int num_iter = 6;
	for ( int i=0; i<num_iter;++i ){
		float t = (float(i)+rnd) / float(num_iter-1);
		vec3 w = spectrum_offset( t );
		sumw += w;
		vec3 texel = texture2D( texture, distort(uv, t, min_distort, max_distort ) ).rgb;
		vec3 texelSSAO = texture2D( textureSSAO, distort(uv, t, min_distort, max_distort ) ).rgb;

		// texel = mix(texel, texelSSAO, .95);
		texel *= texelSSAO;

		sumcol += w * srgb2lin(texel);
	}

	sumcol.rgb  /= sumw;
	vec3 outcol = lin2srgb(sumcol.rgb);
	outcol      += rnd/255.0;


	// float ao = texture2D(textureSSAO, vTextureCoord).r;
	// outcol *= ao;

    gl_FragColor = vec4( outcol, 1.0);
}