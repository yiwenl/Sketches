import alfrid from './libs/alfrid.js';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';

var glslify = require("glslify");

window.alfrid = alfrid;

window.params = {
	numParticles:20,
	skipCount:3,

	metallic:1,
	roughness:0,
	specular:1,
	offset:1,

	gamma:2.2,
	exposure:5
};

let assets = [
	{id:'aomap', url:'assets/aomap.jpg'},
	{id:'light', url:'assets/light.jpg'},
	{id:'obj', url:'assets/004.obj', type:'binary'}
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
}

