import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import dat from 'dat-gui';
import AssetsLoader from 'assets-loader';


window.params = {
	numParticles:128 * 3,
	skipCount:2,
	shadowStrength:.35,
	shadowThreshold:.55,
	numSlides:6,
	gamma:2.2,
	exposure:1
};

let assets = [
	{id:'irr_posx', url:'assets/irr_posx.hdr', type:'binary'},
	{id:'irr_posy', url:'assets/irr_posy.hdr', type:'binary'},
	{id:'irr_posz', url:'assets/irr_posz.hdr', type:'binary'},
	{id:'irr_negx', url:'assets/irr_negx.hdr', type:'binary'},
	{id:'irr_negy', url:'assets/irr_negy.hdr', type:'binary'},
	{id:'irr_negz', url:'assets/irr_negz.hdr', type:'binary'},

	{id:'rad_posx', url:'assets/rad_posx.hdr', type:'binary'},
	{id:'rad_posy', url:'assets/rad_posy.hdr', type:'binary'},
	{id:'rad_posz', url:'assets/rad_posz.hdr', type:'binary'},
	{id:'rad_negx', url:'assets/rad_negx.hdr', type:'binary'},
	{id:'rad_negy', url:'assets/rad_negy.hdr', type:'binary'},
	{id:'rad_negz', url:'assets/rad_negz.hdr', type:'binary'}
]

if(document.body) {
	_init();
} else {
	window.addEventListener('load', ()=>_init());
}

function _init() {
	console.debug('Total Particles :' , params.numParticles * params.numParticles);
	let loader = new AssetsLoader({
		assets:assets
	}).on('error', function(error) {
		console.error(error);
	}).on('progress', function(p) {
		console.log('Progress : ', p);
		// let loader = document.body.querySelector('.Loading-Bar');
		// loader.style.width = (p * 100).toFixed(2) + '%';
	}).on('complete', _onImageLoaded)
	.start();
}


function _onImageLoaded(o) {
	window.assets = o;

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