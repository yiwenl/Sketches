import '../scss/global.scss';
import alfrid, { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';
import Stats from 'stats.js';

const GL = alfrid.GL;
const assets = [
	{ id:'heightmap', url:'assets/img/height.jpg' },
	{ id:'normalmap', url:'assets/img/normal.jpg' },
	{ id:'gradient', url:'assets/img/gradient.jpg' },
	{ id:'bg', url:'assets/img/bg.jpg' },
];
window.params = {
	numParticles:256*4,
	skipCount:3,
	maxRadius: 2.5,
	terrainSize: 100,
	maxHeight: 15,
	offset: 0.995,
	renderTerrain:false
};

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);	
}


function _init() {

	//	LOADING ASSETS
	if(assets.length > 0) {
		document.body.classList.add('isLoading');

		let loader = new AssetsLoader({
			assets:assets
		}).on('error', function (error) {
			console.error(error);
		}).on('progress', function (p) {
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
	window.assets = o;
	const loader = document.body.querySelector('.Loading-Bar');
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}

window.getAsset = function(id) {
	return window.assets.find( (a) => a.id === id).file;
}


function _init3D() {

	//	CREATE CANVAS
	let canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	CREATE SCENE
	let scene = new SceneApp();

	//	STATS
	const stats = new Stats();
	document.body.appendChild(stats.domElement);
	alfrid.Scheduler.addEF(()=>stats.update());

	//	INIT DAT-GUI
	window.gui = new dat.GUI({ width:300 });
	gui.add(params, 'maxRadius', 0.0, 10.0);
	gui.add(params, 'offset', 0.9, 1.0).listen();
	gui.add(params, 'renderTerrain');

}