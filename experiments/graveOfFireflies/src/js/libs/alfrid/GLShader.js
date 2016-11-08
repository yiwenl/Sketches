// GLShader.js

'use strict';

import GL from './GLTool';
const glslify = require('glslify');
function isSame(array1, array2) {
	if(array1.length !== array2.length) {
		return false;
	}

	for(let i = 0; i < array1.length; i++) {
		if(array1[i] !== array2[i]) {
			return false;
		}
	}

	return true;
};

function addLineNumbers(string) {
	const lines = string.split('\n');
	for (let i = 0; i < lines.length; i ++) {
		lines[i] = `${(i + 1)}: ${lines[i]}`;
	}
	return lines.join('\n');
};

let gl;
const defaultVertexShader = require('./shaders/basic.vert');
const defaultFragmentShader = require('./shaders/basic.frag');

const uniformMapping = {
	float: 'uniform1f',
	vec2: 'uniform2fv',
	vec3: 'uniform3fv',
	vec4: 'uniform4fv',
	int: 'uniform1i',
	mat3: 'uniformMatrix3fv',
	mat4: 'uniformMatrix4fv'
};

class GLShader {
	constructor(strVertexShader = defaultVertexShader, strFragmentShader = defaultFragmentShader) {

		gl                   = GL.gl;
		this.parameters      = [];
		this.uniformTextures = [];

		if(!strVertexShader) { strVertexShader = defaultVertexShader; }
		if(!strFragmentShader) { strFragmentShader = defaultVertexShader; }

		const vsShader = this._createShaderProgram(strVertexShader, true);
		const fsShader = this._createShaderProgram(strFragmentShader, false);
		this._attachShaderProgram(vsShader, fsShader);

	}


	bind() {

		gl.useProgram(this.shaderProgram);
		GL.useShader(this);
		this.uniformTextures = [];

	}


	uniform(mName, mType, mValue) {
		function cloneArray(mArray) {
			if(mArray.slice) {
				return mArray.slice(0); 
			} else {
				return new Float32Array(mArray);
			}
		}

		// if(mValue === undefined || mValue === null) {
		// 	console.warn('mValue Error:', mName);
		// 	return;
		// }

		const uniformType = uniformMapping[mType] || mType;
		

		let hasUniform = false;
		let oUniform;
		let parameterIndex = -1;


		for(let i = 0; i < this.parameters.length; i++) {
			oUniform = this.parameters[i];
			if(oUniform.name === mName) {
				hasUniform = true;
				parameterIndex = i;
				break;
			}
		}

		let isNumber = false;
		if(!hasUniform) {
			this.shaderProgram[mName] = gl.getUniformLocation(this.shaderProgram, mName);
			isNumber = uniformType === 'uniform1i' || uniformType === 'uniform1f';
			if(isNumber) {
				this.parameters.push({ name : mName, type: uniformType, value: mValue, uniformLoc: this.shaderProgram[mName], isNumber:isNumber });	
			} else {
				this.parameters.push({ name : mName, type: uniformType, value: cloneArray(mValue), uniformLoc: this.shaderProgram[mName], isNumber:isNumber });	
			}
			
			parameterIndex = this.parameters.length - 1;
		} else {
			this.shaderProgram[mName] = oUniform.uniformLoc;
			isNumber = oUniform.isNumber;
		}


		if(!this.parameters[parameterIndex].uniformLoc) {
			return;
		}


		if(uniformType.indexOf('Matrix') === -1) {
			if(!isNumber) {
				if(!isSame(this.parameters[parameterIndex].value, mValue) || !hasUniform) {
					gl[uniformType](this.shaderProgram[mName], mValue);	
					this.parameters[parameterIndex].value = cloneArray(mValue);
				}
			} else {
				const needUpdate = (this.parameters[parameterIndex].value !== mValue || !hasUniform);
				if(needUpdate) {
					gl[uniformType](this.shaderProgram[mName], mValue);	
					this.parameters[parameterIndex].value = mValue;
				}
			}

		} else {
			if(!isSame(this.parameters[parameterIndex].value, mValue) || !hasUniform) {
				gl[uniformType](this.shaderProgram[mName], false, mValue);	
				this.parameters[parameterIndex].value = cloneArray(mValue);

			}
		}

	}


	_createShaderProgram(mShaderStr, isVertexShader) {
		
		const shaderType = isVertexShader ? GL.VERTEX_SHADER : GL.FRAGMENT_SHADER;
		const shader = gl.createShader(shaderType);

		gl.shaderSource(shader, mShaderStr);
		gl.compileShader(shader);

		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.warn('Error in Shader : ', gl.getShaderInfoLog(shader));
			console.log(addLineNumbers(mShaderStr));
			return null;
		}

		return shader;
	}

	_attachShaderProgram(mVertexShader, mFragmentShader) {

		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, mVertexShader);
		gl.attachShader(this.shaderProgram, mFragmentShader);
		gl.linkProgram(this.shaderProgram);

	}

}


export default GLShader;