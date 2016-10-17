import '../scss/global.scss';
import alfrid, { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
// import dat from 'dat-gui';
// import Stats from 'stats.js';

const GL = alfrid.GL;

window.params = {
	gamma:5.2,
	exposure:5,
	terrainSize:55,
	maxHeight:1,
	grassRange:20,
	pushStrength:0,
	speed:-0.001,
	time:0,
	noiseScale:2.5,
	isOne:false,
	grassColor:[98, 152, 83],
	yOffset:-7.95
};

const assets = [
	{ id:'cloud', url:'assets/img/cloud.png' },
	{ id:'day', url:'assets/img/day.jpg' },
	{ id:'night', url:'assets/img/winter.jpg' },
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
	// console.log('Image Loaded : ', o);
	window.assets = o;
	const loader = document.body.querySelector('.Loading-Bar');
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}

window.vrDisplay = null;
window.frameData = null;

function _init3D() {
	//	CREATE CANVAS
	let canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	INIT DAT-GUI
	// window.gui = new dat.GUI({ width:300 });

	//	CREATE SCENE
	

	console.log('getVR', navigator.getVRDisplays);

	if (navigator.getVRDisplays) {
		window.frameData = new VRFrameData();

		console.log('Frame Data : ', frameData);

		navigator.getVRDisplays().then(function (displays) {
		          // Use the first display in the array if one is available. If multiple
		          // displays are present you may want to present the user with a way to
		          // select which display they wish to use.
			if (displays.length > 0) {
				window.vrDisplay = displays[0];
				vrDisplay.depthNear = 0.1;
				vrDisplay.depthFar = 1024.0;

				console.log('VR display : ', vrDisplay, vrDisplay.capabilities.canPresent);
				if (vrDisplay.capabilities.canPresent) {
					document.body.classList.add('hasVR');
					let btnVR = document.body.querySelector('#enterVr');
					btnVR.addEventListener('click', onVRRequestPresent);

					window.addEventListener('vrdisplaypresentchange', onVRPresentChange, false);

					window.addEventListener('vrdisplayactivate', onVRRequestPresent, false);
					window.addEventListener('vrdisplaydeactivate', onVRExitPresent, false);
				}

				// window.frameData = frameData;
				// window.vrDisplay = vrDisplay;
			// Being able to re-center your view is a useful thing in VR. It's
			// good practice to provide your users with a simple way to do so.
				// VRSamplesUtil.addButton("Reset Pose", "R", null, function () { vrDisplay.resetPose(); });
			} else {
				// VRSamplesUtil.addInfo("WebVR supported, but no VRDisplays found.", 3000);
			}
		});



	}

	let scene = new SceneApp();
	
	/*/
	gui.add(params, 'gamma', 1, 5);
	gui.add(params, 'exposure', 1, 25);
	gui.add(params, 'maxHeight', 0, 5);
	gui.addColor(params, 'grassColor');
	gui.add(scene, 'switch');
	//*/

	// const stats = new Stats();
	// document.body.appendChild(stats.domElement);
	// alfrid.Scheduler.addEF(()=> {
	// 	stats.update();
	// });
}


function onVRRequestPresent () {
	console.log('on Present : ', GL.canvas);
        // This can only be called in response to a user gesture.
	vrDisplay.requestPresent([{ source: GL.canvas }]).then(function () {
	// Nothing to do because we're handling things in onVRPresentChange.
		console.log(' on request VR ');
	}, function () {
		console.debug("requestPresent failed.");
		// VRSamplesUtil.addError("requestPresent failed.", 2000);
	});
}

function onVRExitPresent () {
// No sense in exiting presentation if we're not actually presenting.
// (This may happen if we get an event like vrdisplaydeactivate when
// we weren't presenting.)
	if (!vrDisplay.isPresenting)
		return;

	vrDisplay.exitPresent().then(function () {
	// Nothing to do because we're handling things in onVRPresentChange.
	}, function () {
		// VRSamplesUtil.addError("exitPresent failed.", 2000);
	});
}

function onResize() {

}

function onVRPresentChange () {
	console.log('present change', vrDisplay.isPresenting, vrDisplay.capabilities.hasExternalDisplay);
        // When we begin or end presenting, the canvas should be resized to the
        // recommended dimensions for the display.
	onResize();

	if (vrDisplay.isPresenting) {
		if (vrDisplay.capabilities.hasExternalDisplay) {
		// Because we're not mirroring any images on an external screen will
		// freeze while presenting. It's better to replace it with a message
		// indicating that content is being shown on the VRDisplay.
		// presentingMessage.style.display = "block";

		// On devices with an external display the UA may not provide a way
		// to exit VR presentation mode, so we should provide one ourselves.
		// VRSamplesUtil.removeButton(vrPresentButton);
		// vrPresentButton = VRSamplesUtil.addButton("Exit VR", "E", "media/icons/cardboard64.png", onVRExitPresent);
		}
	} else {
		// If we have an external display take down the presenting message and
		// change the button back to "Enter VR".
		if (vrDisplay.capabilities.hasExternalDisplay) {
			// presentingMessage.style.display = "";

			// VRSamplesUtil.removeButton(vrPresentButton);
			// vrPresentButton = VRSamplesUtil.addButton("Enter VR", "E", "media/icons/cardboard64.png", onVRRequestPresent);
		}
	}
}