import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import dat from 'dat-gui';
import AssetsLoader from 'assets-loader';

window.params = {
	metallic:1,
	roughness:1,
	specular:1,
	offset:0,
	color:[255, 255, 255],
	gamma:2.2,
	exposure:5,
	maxRange:15,

	numParticles:32,
	particleLightDensity:.35,
	particleAvoidingForce:.2,
	particleAvoidingDistance:.3,

	skipCount:1,
	showWires:false
};

if(document.body) {
	_init();
} else {
	window.addEventListener('load', ()=>_init());
}


let assets = [
	{id:'aomap', url:'assets/aomap.jpg'},
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

function _init() {
	let loader = new AssetsLoader({
		assets:assets
	}).on('error', function(error) {
		console.error(error);
	}).on('progress', function(p) {
		console.log('Progress : ', p);
		let loader = document.body.querySelector('.Loading-Bar');
		loader.style.width = (p * 100).toFixed(2) + '%';
	}).on('complete', _onImageLoaded)
	.start();

	window.addEventListener('keydown', (e)=>{
		if(e.keyCode == 87) {
			params.showWires = !params.showWires
			console.log(params.showWires);
		}
	})
}


function _onImageLoaded(o) {
	window.assets = o;
	_init3D();


	let gui = new dat.GUI({width:300});
	gui.add(params, 'offset', 0, 1).listen();
	gui.add(params, 'gamma', 1, 10);
	gui.add(params, 'exposure', 1, 30);
	gui.add(params, 'particleLightDensity', 0, 1);
	gui.add(params, 'particleAvoidingForce', 0, 1);
	gui.add(params, 'particleAvoidingDistance', 0.2, 1);
	gui.add(params, 'maxRange', 10, 50);
}



function _init3D() {
	//	CREATE CANVAS
	let canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT GL TOOL
	alfrid.GL.init(canvas);

	//	INIT SCENE
	let scene = new SceneApp();
}