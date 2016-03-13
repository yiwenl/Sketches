import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';

var glslify = require("glslify");

window.alfrid = alfrid;
window.params = {
	numBalls:10,
	showWires:false
};


let hdrLoader = new alfrid.HDRLoader();
hdrLoader.load('assets/studio.hdr', (img)=>_onImageLoaded(img));


function _onImageLoaded(img) {
	console.log('Image Loaded');
	window.imgStudio = img;

	if(document.body) {
		_init();
	} else {
		window.addEventListener('load', ()=>_init());
	}
}


function _init() {
	//	CREATE CANVAS
	let canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT GL TOOL
	alfrid.GL.init(canvas);

	//	INIT SCENE
	let scene = new SceneApp();

	// window.addEventListener('click', ()=> {
	// 	params.showWires = !params.showWires;
	// })
}


function _loop() {
	GL.clear(0, 0, 0, 0);
	GL.setMatrices(camera);

	time += .02;
	shader.bind();
	shader.uniform('texture', 'uniform1i', 0);
	shader.uniform('time', 'uniform1f', time);
	texture.bind(0);

	batch.draw();
}
