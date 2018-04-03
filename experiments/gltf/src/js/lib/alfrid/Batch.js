// Batch.js

import GL from './GLTool';

class Batch {

	constructor(mGeometry, mShader) {
		this._geometry = mGeometry;
		this._shader = mShader;
	}


	//	PUBLIC METHODS

	draw() {
		this._shader.bind();
		GL.draw(this._geometry);
	}


	//	GETTER AND SETTER

	get geometry() {	return this._geometry;	}

	get shader() {	return this._shader;	}
}

export default Batch;