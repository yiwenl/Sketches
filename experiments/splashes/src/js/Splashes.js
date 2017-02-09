// Splashes.js

import { EventDispatcher } from 'alfrid';

class Splashes extends EventDispatcher { 

	constructor(mMesh, mModelMatrix, mListenerTarget = window) {
		super();

		this._mesh = mMesh;
		this._listenerTarget = mListenerTarget;
		this._init();
	}


	_init() {
	}
}


export default Splashes;