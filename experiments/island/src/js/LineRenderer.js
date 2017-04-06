// LineRenderer.js

import alfrid, { GL } from 'alfrid';

import ViewLines from './ViewLines';

class LineRenderer {
	constructor() {
		this._vLines = new ViewLines();
	}


	render(linesMap, textureExtra) {
		let curr, next;
		for(let i=1; i<linesMap.length-2; i++) {
			curr = linesMap[i].getTexture();
			next = linesMap[i+1].getTexture();

			this._vLines.render(curr, next, textureExtra);
		}
	}
}


export default LineRenderer;