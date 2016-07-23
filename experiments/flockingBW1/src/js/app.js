import '../scss/global.scss';
import alfrid, { Camera } from 'alfrid';
import SceneParticle from './SceneParticle';
import AssetsLoader from 'assets-loader';
// import dat from 'dat-gui';

const GL = alfrid.GL;
const assets = [
];

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
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}


function _init3D() {
	//	CREATE CANVAS
	const canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	INIT DAT-GUI
	// window.gui = new dat.GUI({ width:300 });

	//	CREATE SCENE
	const scene = new SceneParticle();

}