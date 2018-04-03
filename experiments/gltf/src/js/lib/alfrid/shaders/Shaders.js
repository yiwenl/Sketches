// Shaders.js

import GLShader from '../GLShader';

const shaderCache = [];

const definesToString = function (defines) {
	let outStr = '';
	for (const def in defines) {
		if(defines[def]) {
			outStr += `#define ${def} ${defines[def]}\n`;	
		}
		
	}
	return outStr;
};

const getUniformType = function (mValue) {
	if(mValue.length) {
		return `vec${mValue.length}`;
	} else {
		return 'float';
	}
};

const addUniforms = function (mShader, mObjUniforms) {

	let strUniforms = '';
	for(const uniformName in mObjUniforms) {
		const uniformValue = mObjUniforms[uniformName];
		const uniformType = getUniformType(uniformValue);

		strUniforms += `uniform ${uniformType} ${uniformName};\n`;
	}

	mShader = mShader.replace('{{UNIFORMS}}', strUniforms);

	return mShader;
};


const bindUniforms = function (mShader, mObjUniforms) {

	for(const uniformName in mObjUniforms) {
		const uniformValue = mObjUniforms[uniformName];
		const uniformType = getUniformType(uniformValue);
		mShader.uniform(uniformName, uniformType, uniformValue);
	}
	
};

const injectDefines = function (mShader, mDefines) {

	return `${definesToString(mDefines)}\n${mShader}`;

};

const get = (vs, fs, defines = {}) => {
	let _shader;
	const _vs = injectDefines(vs, defines);
	const _fs = injectDefines(fs, defines);

	shaderCache.forEach(shader => {
		if(_vs === shader.vs && _fs === shader.fs) {
			_shader = shader.glShader;
		}
	});

	if (!_shader) {
		_shader = new GLShader(_vs, _fs);
		shaderCache.push({
			vs:_vs,
			fs:_fs,
			glShader:_shader
		});
	}


	return _shader;
};


export default {
	get,
	addUniforms,
	bindUniforms,
	injectDefines
};