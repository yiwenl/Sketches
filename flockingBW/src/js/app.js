import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import dat from 'dat-gui';


window.params = {
	numParticles:64,
	skipCount:5,
	range:1.00,
	speed:.15,
	focus:.79,
	focusDepth:0.5,
	focalLength:0.5,
	fstop:0.5
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
	gui.add(params, 'speed', 0, .5);
	gui.add(params, 'focusDepth', 0, 10);
	gui.add(params, 'focalLength', 0, 10);
	gui.add(params, 'fstop', 0, 10);
	// gui.add(params, 'showCenteroid');
}