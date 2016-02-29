import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import dat from 'dat-gui';


window.params = {
	numParticles:100,
	skipCount:10,
	range:1.70,
	speed:10.5,
	focus:.79
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


	let gui = new dat.GUI({width:300});
	gui.add(params, 'focus', 0, 1);
	gui.add(params, 'range', 0, 2);
	gui.add(params, 'speed', 0, 100.5);
	// gui.add(params, 'showCenteroid');
}