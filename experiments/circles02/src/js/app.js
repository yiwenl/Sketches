import '../scss/global.scss';

import SceneApp from './SceneApp';
import Settings from './Settings';
import preload from './utils/preload';
import addControls from './debug/addControls';

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);
}


function _init() {
	preload().then(init3D, logError);
}

function logError(e){
	console.log('Error', e);
}

function init3D() {
	console.log('IS_DEVELOPMENT', !!window.isDevelopment);
	if(window.isDevelopment) { 
		Settings.init();	 
	}

	//	CREATE SCENE
	const scene = new SceneApp();

	if(window.isDevelopment) { 
		addControls(scene);
	}
}

