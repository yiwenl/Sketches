import '../scss/global.scss';
import alfrid, { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';
import Stats from 'stats.js';

const GL = alfrid.GL;

window.params = {
	gamma:2.2,
	exposure:5,
	grassRange: 5,
	numTiles: 8,
	speed: 0.25,
	lodThresholdLow: 30,
	lodThresholdHigh: 18,
	fogOffset:0.8,
	fogColor:[249/255, 247/255, 245/255],
	zOffset:0,
};

const assets = [
	{ id:'background', url:'assets/img/background.jpg' },
	{ id:'grass', url:'assets/img/grass.png' },
	{ id:'ground', url:'assets/img/ground.jpg' },
	{ id:'radiance', url:'assets/img/studio_radiance.dds', type: 'binary' },
	{ id:'irr_posx', url:'assets/img/irr_posx.hdr', type:'binary' },
	{ id:'irr_posx', url:'assets/img/irr_posx.hdr', type:'binary' },
	{ id:'irr_posy', url:'assets/img/irr_posy.hdr', type:'binary' },
	{ id:'irr_posz', url:'assets/img/irr_posz.hdr', type:'binary' },
	{ id:'irr_negx', url:'assets/img/irr_negx.hdr', type:'binary' },
	{ id:'irr_negy', url:'assets/img/irr_negy.hdr', type:'binary' },
	{ id:'irr_negz', url:'assets/img/irr_negz.hdr', type:'binary' },
];


const NUM_FRAMES = 16;
function getNumber(value) {
	let s = value + '';
	while(s.length<2) s = '0' + s;
	return s;
}

for(let i=0; i<NUM_FRAMES; i++) {
	const num = getNumber(i+1);
	const id = `objWolf${num}`;
	const url = `assets/obj/wolf${num}.obj`;
	const idAo = `aoWolf${num}`;
	const urlAo = `assets/img/aomap${num}.jpg`;
	assets.push({
		id,
		url,
		type:'text'
	});
	assets.push({
		id: idAo,
		url: urlAo
	});
}

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



function _init3D() {
	//	CREATE CANVAS
	let canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	INIT DAT-GUI
	window.gui = new dat.GUI({ width:300 });

	//	CREATE SCENE
	let scene = new SceneApp();
	
	gui.add(params, 'gamma', 1, 5);
	gui.add(params, 'exposure', 1, 25);
	gui.add(params, 'lodThresholdHigh', 5, 50);
	gui.add(params, 'lodThresholdLow', 5, 50);
	gui.add(params, 'fogOffset', 0, 1);


	const stats = new Stats();
	document.body.appendChild(stats.dom);
	alfrid.Scheduler.addEF(()=> {
		stats.update();
	});
}