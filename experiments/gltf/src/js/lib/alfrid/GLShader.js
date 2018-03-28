// GLShader.js

'use strict';

import GL from './GLTool';
const glslify = require('glslify');
const isSame = (array1, array2) => {
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

const addLineNumbers = (string) => {
	const lines = string.split('\n');
	for (let i = 0; i < lines.length; i ++) {
		lines[i] = `${(i + 1)}: ${lines[i]}`;
	}
	return lines.join('\n');
};


const cloneArray = (mArray) => {
	if(mArray.slice) {
		return mArray.slice(0); 
	} else {
		return new Float32Array(mArray);
	}
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
	constructor(strVertexShader = defaultVertexShader, strFragmentShader = defaultFragmentShader, mVaryings) {

		gl                   = GL.gl;
		this.parameters      = [];
		this.uniformTextures = [];
		this._varyings 		 = mVaryings;

		if(!strVertexShader) { strVertexShader = defaultVertexShader; }
		if(!strFragmentShader) { strFragmentShader = defaultVertexShader; }

		const vsShader = this._createShaderProgram(strVertexShader, true);
		const fsShader = this._createShaderProgram(strFragmentShader, false);
		this._attachShaderProgram(vsShader, fsShader);

	}


	bind() {

		if(GL.shader === this) {
			return;
		}
		gl.useProgram(this.shaderProgram);
		GL.useShader(this);
		this.uniformTextures = [];

	}


	uniform(mName, mType, mValue) {
		if(typeof mName === 'object') {
			this.uniformObject(mName);
			return;
		}
		/*
		if(!!mValue === undefined || mValue === null) {
			console.warn('mValue Error:', mName);
			return;
		}
	*/
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
			isNumber = uniformType === 'uniform1i' || uniformType === 'uniform1f';
			this.shaderProgram[mName] = gl.getUniformLocation(this.shaderProgram, mName);
			if(isNumber) {
				this.parameters.push({ name : mName, type: uniformType, value: mValue, uniformLoc: this.shaderProgram[mName], isNumber });	
			} else {
				this.parameters.push({ name : mName, type: uniformType, value: cloneArray(mValue), uniformLoc: this.shaderProgram[mName], isNumber });
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

	uniformObject(mUniformObj) {
		for(const uniformName in mUniformObj) {
			let uniformValue = mUniformObj[uniformName];
			const uniformType = GLShader.getUniformType(uniformValue);

			if(uniformValue.concat && uniformValue[0].concat) {
				let tmp = [];
				for(let i=0; i<uniformValue.length; i++) {
					tmp = tmp.concat(uniformValue[i]);
				}
				uniformValue = tmp;
			}
			
			this.uniform(uniformName, uniformType, uniformValue);
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

		gl.deleteShader(mVertexShader);
		gl.deleteShader(mFragmentShader);

		if(this._varyings) {
			console.log('Transform feedback setup : ', this._varyings);
			gl.transformFeedbackVaryings(this.shaderProgram, this._varyings, gl.SEPARATE_ATTRIBS);
		}

		gl.linkProgram(this.shaderProgram);

	}

}

GLShader.getUniformType = function (mValue) {
	const isArray = !!mValue.concat;

	const getArrayUniformType = function (mValue) {
		if(mValue.length === 9) {
			return 'uniformMatrix3fv';
		} else if(mValue.length === 16) {
			return 'uniformMatrix4fv';
		} else {
			return `vec${mValue.length}`;	
		}
	};

	if(!isArray) {
		return 'float';
	} else {
		if (!mValue[0].concat) {
			return getArrayUniformType(mValue);	
		} else {
			return getArrayUniformType(mValue[0]);
		}
	}
};


export default GLShader;