// GLCubeTexture.js

'use strict';

import GL from './GLTool';
import parse from 'parse-dds';
let gl;
const DDSD_MIPMAPCOUNT = 0x20000;
const OFF_MIPMAPCOUNT = 7;
const headerLengthInt = 31;

class GLCubeTexture {
	constructor(mSource, mParameters = {}, isCubeTexture = false) {
		gl = GL.gl;

		if(isCubeTexture) {
			this.texture = mSource;
			return;
		}

		let hasMipmaps = mSource.length > 6;
		if(mSource[0].mipmapCount) {
			hasMipmaps = mSource[0].mipmapCount > 1;
		}

		this.texture   = gl.createTexture();
		this.magFilter = mParameters.magFilter || gl.LINEAR;
		this.minFilter = mParameters.minFilter || gl.LINEAR_MIPMAP_LINEAR;
		this.wrapS     = mParameters.wrapS || gl.CLAMP_TO_EDGE;
		this.wrapT     = mParameters.wrapT || gl.CLAMP_TO_EDGE;

		if(!hasMipmaps && this.minFilter == gl.LINEAR_MIPMAP_LINEAR) {
			this.minFilter = gl.LINEAR;
		}

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
		const targets = [
			gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
			gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
			gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
		];

		
		let numLevels = 1;
		let index = 0;
		numLevels = mSource.length / 6;
		this.numLevels = numLevels;

		if (hasMipmaps) {
			for (let j = 0; j < 6; j++) {
				for (let i = 0; i < numLevels; i++) {
					gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				
					index = j * numLevels + i;
					if(mSource[index].shape) {
						gl.texImage2D(targets[j], i, gl.RGBA, mSource[index].shape[0], mSource[index].shape[1], 0, gl.RGBA, gl.FLOAT, mSource[index].data);
					} else {
						gl.texImage2D(targets[j], i, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mSource[index]);
					}

					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.wrapS);
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.wrapT);
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this.magFilter);
					gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this.minFilter);
				}
			}
		} else {
			let index = 0;
			for (let j = 0; j < 6; j++) {
				index = j * numLevels;
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				if(mSource[index].shape) {
					gl.texImage2D(targets[j], 0, gl.RGBA, mSource[index].shape[0], mSource[index].shape[1], 0, gl.RGBA, gl.FLOAT, mSource[index].data);
				} else {
					gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mSource[index]);
				}
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.wrapS);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.wrapT);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this.magFilter);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this.minFilter);
			}

			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		}

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	}

	

	//	PUBLIC METHOD

	bind(index = 0) {
		if(!GL.shader) { return; }

		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
		gl.uniform1i(GL.shader.uniformTextures[index], index);
		this._bindIndex = index;
	}

	unbind() {
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);	
	}
}


GLCubeTexture.parseDDS = function parseDDS(mArrayBuffer) {

	function clamp(value, min, max) {
		if (min > max) {
			return clamp(value, max, min);
		}

		if (value < min) return min;
		else if (value > max) return max;
		else return value;
	}

	//	CHECKING MIP MAP LEVELS
	const ddsInfos = parse(mArrayBuffer);
	const { flags } = ddsInfos;
	const header = new Int32Array(mArrayBuffer, 0, headerLengthInt);
	let mipmapCount = 1;
	if (flags & DDSD_MIPMAPCOUNT) {
		mipmapCount = Math.max(1, header[OFF_MIPMAPCOUNT]);
	}
	const sources = ddsInfos.images.map((img) => {
		const faceData = new Float32Array(mArrayBuffer.slice(img.offset, img.offset + img.length));
		return {
			data: faceData,
			shape: img.shape,
			mipmapCount,
		};
	});

	return new GLCubeTexture(sources);
};


export default GLCubeTexture;