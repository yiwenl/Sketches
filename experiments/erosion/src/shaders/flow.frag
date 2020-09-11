// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D textureTerrain;
uniform sampler2D textureFlux;

uniform float uSimRes;
uniform float uPipeLen;
uniform float uTimestep;
uniform float uPipeArea;

float A = 20.0;

void main(void) {
    float timestep = uTimestep;
    // vec2 vTextureCoord = 0.5f*fs_Pos+0.5f;
    float texwidth = uSimRes;
    float div = 1.0/texwidth;
    float g = .5;
    float pipelen = uPipeLen;


    vec4 top = texture2D(textureTerrain, vTextureCoord+vec2(0.0,div));
    vec4 right = texture2D(textureTerrain, vTextureCoord+vec2(div,0.0));
    vec4 bottom = texture2D(textureTerrain, vTextureCoord+vec2(0.0,-div));
    vec4 left = texture2D(textureTerrain, vTextureCoord+vec2(-div,0.0));

    vec4 cur = texture2D(textureTerrain, vTextureCoord);
    vec4 curflux = texture2D(textureFlux, vTextureCoord);

    float Htopout = (cur.y+cur.x)-(top.y+top.x);
    float Hrightout = (cur.y+cur.x)-(right.y+right.x);
    float Hbottomout = (cur.y+cur.x)-(bottom.x+bottom.y);
    float Hleftout = (cur.y+cur.x)-(left.y+left.x);

    //out flow flux
    float ftopout = max(0.0,curflux.x+(timestep * g * uPipeArea * Htopout)/pipelen);
    float frightout = max(0.0,curflux.y+(timestep * g * uPipeArea * Hrightout)/pipelen);
    float fbottomout = max(0.0,curflux.z+(timestep * g * uPipeArea * Hbottomout)/pipelen);
    float fleftout = max(0.0,curflux.w+(timestep * g * uPipeArea * Hleftout)/pipelen);


    float k = min(1.0,(cur.y*div*div)/(timestep*(ftopout+frightout+fbottomout+fleftout)));

    //rescale outflow flux so that outflow don't exceed current water volume
    ftopout *= k;
    frightout *= k;
    fbottomout *= k;
    fleftout *= k;

    //boundary conditions
    if(vTextureCoord.x==0.0) fleftout = 0.0;
    if(vTextureCoord.x==1.0) frightout = 0.0;
    if(vTextureCoord.y==0.0) ftopout = 0.0;
    if(vTextureCoord.y==1.0) fbottomout = 0.0;

    gl_FragColor = vec4(ftopout,frightout,fbottomout,fleftout);
    // gl_FragColor = vec4(ftopout,frightout,fbottomout,1.0) * 100000.0;
    // gl_FragColor = cur;
}