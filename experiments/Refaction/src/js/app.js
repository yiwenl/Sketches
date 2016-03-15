import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
// import dat from 'dat-gui';

var glslify = require("glslify");

window.alfrid = alfrid;

window.params = {
	numParticles:20,
	skipCount:3,

	metallic:1,
	roughness:.9,
	specular:0,
	offset:.95,

	refractionRate:1.33,
	gamma:2.2,
	exposure:1.0,
	threshold:.5,
	blurRange:.25,
	numBlur:1,
	multiply:1.0,
	debug:false,

	showWires:false

};

let assets = [
	{id:'aomap', url:'assets/aomap.jpg'},
	{id:'objModel', url:'assets/statue.obj', type:'binary'},
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
	document.body.classList.add('isLoading');
	
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
		}
	});
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

	// let gui = new dat.GUI({width:300});
	// gui.add(params, 'refractionRate', 1, 3);
	// gui.add(params, 'roughness', 0, 1);
	// gui.add(params, 'metallic', 0, 1);
	// gui.add(params, 'specular', 0, 1);
	// gui.add(params, 'threshold', 0., 1);
	// gui.add(params, 'blurRange', 0.125, 1);
	// gui.add(params, 'debug');
	// gui.close();
}

