// ShaderUtils.js

const ShaderUtils = {

};

const getUniformType = function (mValue) {
	if(mValue.length) {
		return `vec${mValue.length}`;
	} else {
		return 'float';
	}
};

ShaderUtils.addUniforms = function (mShader, mObjUniforms) {

	let strUniforms = '';
	for(const uniformName in mObjUniforms) {
		const uniformValue = mObjUniforms[uniformName];
		const uniformType = getUniformType(uniformValue);

		strUniforms += `uniform ${uniformType} ${uniformName};\n`;
	}

	mShader = mShader.replace('{{UNIFORMS}}', strUniforms);

	return mShader;
};


ShaderUtils.bindUniforms = function (mShader, mObjUniforms) {

	for(const uniformName in mObjUniforms) {
		const uniformValue = mObjUniforms[uniformName];
		const uniformType = getUniformType(uniformValue);
		mShader.uniform(uniformName, uniformType, uniformValue);
	}
	
};


export default ShaderUtils;