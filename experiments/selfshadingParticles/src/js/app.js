import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
// import dat from 'dat-gui';

window.alfrid = alfrid;
let hasStarted = false;

window.params = {
	numParticles:512,
	skipCount:5,
	shadowStrength:.35,
	shadowThreshold:.55,
	showWires:false
};

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', ()=>_init());
}

function _init() {
	console.log('init');
	if(hasStarted) {
		return;
	}
	hasStarted = true;
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

	// window.addEventListener('click', ()=> {
	// 	params.showWires = !params.showWires;
	// })
}