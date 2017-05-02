import '../scss/global.scss';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';
import Scene from './Scene';
import _pixi from 'PIXI';
import assets from './asset-list';


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
	console.log('Image Loaded : ');
	console.table(o);
	window.assets = o;

	window.getAsset = function(mId) {
		const asset = window.assets.find((a)=> {
			return a.id === mId;
		});

		if(!asset) return null;

		return asset.file;
	}
	const loader = document.body.querySelector('.Loading-Bar');
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}

function _init3D() {
	//	CREATE CANVAS
	const scene = new Scene();
}

