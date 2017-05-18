// VertexArrayObject.js

export default function getAndApplyExtension(gl, name) {
	const ext = gl.getExtension(name);
	if (!ext) {
		return false;
	}
	const suffix = name.split('_')[0];
	const suffixRE = new RegExp(`${suffix}$`);

	for (const key in ext) {
		const val = ext[key];
		if (typeof(val) === 'function') {
			const unsuffixedKey = key.replace(suffixRE, '');
			if (key.substring) {
				gl[unsuffixedKey] = ext[key].bind(ext);	
				// console.log('Replacing :', key, '=>', unsuffixedKey);
			}
		}
	}

	return true;
}