import '../scss/global.scss';
import alfrid , { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';

const GL = alfrid.GL;

window.params = {
	gamma:2.2,
	exposure:5
};

const assets = [
	{id:'aomap', url:'assets/aomap.jpg'},
	{id:'normalmap', url:'assets/normalmap.jpg'},
	{id:'colormap', url:'assets/colormap.jpg'},
	{id:'irr_posx', url:'assets/irr_posx.hdr', type:'binary'},
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
	document.body.classList.remove('isLoading');
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
	window.gui = new dat.GUI({width:300});

	//	CREATE SCENE
	let scene = new SceneApp();

	
	// gui.add(params, 'gamma', 1, 5);
	// gui.add(params, 'exposure', 1, 25);
}