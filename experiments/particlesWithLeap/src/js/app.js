import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import dat from 'dat-gui';

window.alfrid = alfrid;


window.params = {
	numParticles:256*2,
	skipCount:5,
	shadowStrength:.35,
	shadowThreshold:.55,
	baseRadius:3
};

if(document.body) {
	_init();
} else {
	window.addEventListener('load', ()=>_init());
}

function _init() {
	console.debug('Total Particles :' , params.numParticles * params.numParticles);

	//	CREATE CANVAS
	let canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT GL TOOL
	alfrid.GL.init(canvas);

	//	INIT SCENE
	let scene = new SceneApp();


	// let gui = new dat.GUI({width:300});
	// gui.add(params, 'shadowStrength', 0, 1);
	// gui.add(params, 'shadowThreshold', 0, 1);
}