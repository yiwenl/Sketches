import '../scss/global.scss';
import alfrid , { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
// import dat from 'dat-gui';

const GL = alfrid.GL;

window.params = {
	numParticles:256,
	numSnow:256/4,
	skipCount:10,
	gamma:2.2,
	exposure:5,
	offset:1.0,
	maxRadius:1.5,
	domeRadius:5.5,
	flyThreshold:0.75,
	renderEnvironment:true,
	renderParticles:true,
	particleColor:[255, 255, 255],
	particleOpacity:new alfrid.TweenNumber(0, 'expIn'),
	time:Math.random() * 999
};


window.colors = [
	[255/255, 45/255, 0/255],
	[255/255, 160/255, 160/255],
	[180/255, 255/255, 114/255],
	[255/255, 45/255, 0/255]
]

const assets = [
	{id:'aoTerrain', url:'assets/aoTerrain.jpg'},
	{id:'aoTree', url:'assets/aoTree.jpg'},
	{id:'winter', url:'assets/winter.jpg'},
	{id:'spring', url:'assets/spring.jpg'},
	{id:'summer', url:'assets/summer.jpg'},
	{id:'fall', url:'assets/fall.jpg'},
	{id:'noise', url:'assets/noise.jpg'},
];

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);	
}


function _init() {

	//	LOADING ASSETS
	if(assets.length > 0 ) {
		document.body.classList.add('isLoading');

		let loader = new AssetsLoader({
			assets:assets
		}).on('error', function(error) {
			console.error(error);
		}).on('progress', function(p) {
			// console.log('Progress : ', p);
			let loader = document.body.querySelector('.Loading-Bar');
			if(loader) loader.style.width = (p * 100).toFixed(2) + '%';
		}).on('complete', _onImageLoaded)
		.start();	
	} else {
		_init3D();
	}

}


function _onImageLoaded(o) {

	//	ASSETS
	console.log('Image Loaded : ', o);
	// document.body.classList.remove('isLoading');
	window.assets = o;	

	_init3D();
}


function _init3D() {
	//	CREATE CANVAS
	let canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	INIT DAT-GUI
	// window.gui = new dat.GUI({width:300});
	// gui.add(params, 'flyThreshold', 0, 1);
	// gui.add(params, 'renderParticles');
	// gui.add(params, 'renderEnvironment');
	// gui.addColor(params, 'particleColor');

	//	CREATE SCENE
	let scene = new SceneApp();
}