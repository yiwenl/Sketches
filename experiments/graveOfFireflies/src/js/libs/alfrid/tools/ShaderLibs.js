// ShaderLbs.js

'use strict';

const simpleColorFrag = require('../shaders/simpleColor.frag');
const bigTriangleVert = require('../shaders/bigTriangle.vert');
const generalVert = require('../shaders/general.vert');
const copyFrag = require('../shaders/copy.frag');
const basicVert = require('../shaders/basic.vert');
const skyboxVert = require('../shaders/skybox.vert');
const skyboxFrag = require('../shaders/skybox.frag');

const ShaderLibs = {
	simpleColorFrag,
	bigTriangleVert,
	generalVert,
	copyFrag,
	basicVert,
	skyboxVert,
	skyboxFrag,
};


export default ShaderLibs;