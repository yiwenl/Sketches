// ShaderLbs.js

'use strict';

import simpleColorFrag from '../shaders/simpleColor.frag';
import bigTriangleVert from '../shaders/bigTriangle.vert';
import generalVert from '../shaders/general.vert';
import copyFrag from '../shaders/copy.frag';
import basicVert from '../shaders/basic.vert';
import skyboxVert from '../shaders/skybox.vert';
import skyboxFrag from '../shaders/skybox.frag';
import pbrVert from '../shaders/pbr.vert';
import pbrColorFrag from '../shaders/pbrColor.frag';
import pbrTextureFrag from '../shaders/pbrTexture.frag';

const ShaderLibs = {
	simpleColorFrag,
	bigTriangleVert,
	generalVert,
	copyFrag,
	basicVert,
	skyboxVert,
	skyboxFrag,
	pbrVert,
	pbrColorFrag,
	pbrTextureFrag,
};


export default ShaderLibs;