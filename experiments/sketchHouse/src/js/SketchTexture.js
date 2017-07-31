// SketchTexture.js


const numLevels = 5;
const canvasSize = 256;

class SketchTexture {
	constructor() {

		for(let i=0; i<numLevels; i++) {
			this.createLevel(i);
		}

	}


	createLevel(mLevel) {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext('2d');
	} 
}


export default SketchTexture;