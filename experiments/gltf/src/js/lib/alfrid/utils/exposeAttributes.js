// exposeAttributes.js

import GL from '../GLTool';
import WebglConst from './WebglConst';

const exposeAttributes = function () {
	// GL.VERTEX_SHADER         = GL.gl.VERTEX_SHADER;
	// GL.FRAGMENT_SHADER       = GL.gl.FRAGMENT_SHADER;
	// GL.COMPILE_STATUS        = GL.gl.COMPILE_STATUS;
	// GL.DEPTH_TEST            = GL.gl.DEPTH_TEST;
	// GL.CULL_FACE             = GL.gl.CULL_FACE;
	// GL.BLEND                 = GL.gl.BLEND;
	// GL.POINTS                = GL.gl.POINTS;
	// GL.LINES                 = GL.gl.LINES;
	// GL.TRIANGLES             = GL.gl.TRIANGLES;
	
	// GL.LINEAR                	= GL.gl.LINEAR;
	// GL.NEAREST               	= GL.gl.NEAREST;
	// GL.LINEAR_MIPMAP_NEAREST 	= GL.gl.LINEAR_MIPMAP_NEAREST;
	// GL.NEAREST_MIPMAP_LINEAR 	= GL.gl.NEAREST_MIPMAP_LINEAR;
	// GL.LINEAR_MIPMAP_LINEAR 	= GL.gl.LINEAR_MIPMAP_LINEAR;
	// GL.NEAREST_MIPMAP_NEAREST 	= GL.gl.NEAREST_MIPMAP_NEAREST;
	// GL.MIRRORED_REPEAT       	= GL.gl.MIRRORED_REPEAT;
	// GL.CLAMP_TO_EDGE         	= GL.gl.CLAMP_TO_EDGE;
	// GL.SCISSOR_TEST		   	 	= GL.gl.SCISSOR_TEST;
	// GL.UNSIGNED_BYTE		 	= GL.gl.UNSIGNED_BYTE;
	for (const s in WebglConst) {
		if(!GL[s]) {
			GL[s] = WebglConst[s];
		} else {
			console.log('already exist : ', s);
		}
		
	}
};


export default exposeAttributes;