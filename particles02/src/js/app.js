import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import dat from 'dat-gui';


window.params = {
	numParticles:256*2,
	skipCount:5,
	shadowStrength:.35,
	shadowThreshold:.55,
	numSlides:2*4
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

}