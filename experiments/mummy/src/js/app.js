import '../scss/global.scss';
import debugPolyfill from './debug/debugPolyfill';
import alfrid, { GL } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import Settings from './Settings';
import assets from './asset-list';
import Assets from './Assets';

import Capture from './utils/Capture';
import addControls from './debug/addControls';

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);
}


function _init() {

	//	LOADING ASSETS
	if(assets.length > 0) {
		document.body.classList.add('isLoading');

		const loader = new AssetsLoader({
			assets:assets
		})
		.on('error', (error)=>{
			console.log('Error :', error);
		})
		.on('progress', (p) => {
			// console.log('Progress : ', p);
			const loader = document.body.querySelector('.Loading-Bar');
			if(loader) loader.style.width = `${(p * 100)}%`;
		})
		.on('complete', _onImageLoaded)
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
	console.log('Loader :', loader);
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}


function _init3D() {
	console.log('IS_DEVELOPMENT', !!window.isDevelopment);
	if(window.isDevelopment) { 
		Settings.init();	 
	}

	//	CREATE CANVAS
	const canvas = document.createElement('canvas');
	const container = document.body.querySelector('.container');
	canvas.className = 'Main-Canvas';
	container.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas, {ignoreWebgl2:true, preserveDrawingBuffer:true});

	//	INIT ASSETS
	Assets.init();

	//	CREATE SCENE
	const scene = new SceneApp();

	if(window.isDevelopment) { 
		addControls(scene);
	}
	
}