import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import dat from 'dat-gui';


window.params = {
	numParticles:64,
	skipCount:5,
	shadowStrength:.35,
	shadowThreshold:.55,
	numSlides:2*2,
	numClusters:7,
	showCenteroid:true,
	showWires:false
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
	gui.add(params, 'numClusters', 3, 20).step(1);
	gui.add(params, 'showCenteroid');

	window.addEventListener('keydown', (e)=>{
		if(e.keyCode == 87) {
			params.showWires = !params.showWires
		}
	});
}