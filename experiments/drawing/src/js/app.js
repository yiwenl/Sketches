import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
// import dat from 'dat-gui';


window.params = {
	numParticles:128*6,
	skipCount:10,
	range:1.2,
	speed:1.5,
	focus:.79,
	minThreshold:.50,
	maxThreshold:.80,
	isInvert:false,
	showWires:false,
	numSlides:2
};

if(document.body) {
	_init();
} else {
	window.addEventListener('load', ()=>_init());
}



function _init() {

	let img = new Image();
	img.addEventListener('load', (e)=>_onImageLoaded(e));
	// img.src = 'assets/orion.png';
	img.src = 'assets/aquarius.png';
	
	// window.addEventListener('click', ()=>{
	// 	console.log('Show Wire ? ', params.showWires);
	// 	params.showWires = !params.showWires
	// });		

}

function _onImageLoaded(e) {
	console.log(e.target);
	window.imgConstellation = e.target;
	console.debug('Total Particles :' , params.numParticles * params.numParticles);

	//	CREATE CANVAS
	let canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT GL TOOL
	alfrid.GL.init(canvas);

	//	INIT SCENE
	let scene = new SceneApp();

	/*/
	let gui = new dat.GUI({width:300});
	gui.add(params, 'focus', 0, 1);
	gui.add(params, 'range', 0, 2);
	gui.add(params, 'speed', 0, 100.5);
	gui.add(params, 'minThreshold', 0, 1);
	gui.add(params, 'maxThreshold', 0, 1);	
	//*/
	

	window.addEventListener('keydown', (e)=>_onKey(e));		
}


function _onKey(e) {
	if(e.keyCode == 32) {
		//	SPACE KEY TO TOGGLE COLOUR THEME
		params.isInvert = !params.isInvert;
	}
}