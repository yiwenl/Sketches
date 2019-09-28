// addControls.js

import Settings from '../Settings';
import Config from '../Config';
import { saveJson } from '../utils';

const addControls = (scene) => {

	const oControl = {
		save:() => {
			saveJson(Config, 'Settings');
		}
	}

	setTimeout(()=> {
		gui.add(Config, 'numParticles', 32, 256).onFinishChange(Settings.reload);
		gui.add(Config, 'usingCubes').listen().onFinishChange(Settings.refresh);
		// gui.add(oControl, 'save').name('Save Settings');
		// gui.add(Settings, 'reset').name('Reload');
	}, 200);


	window.addEventListener('keydown', (e) => {
		// console.log(e.keyCode);
		if(e.keyCode === 32) {
			Config.usingCubes = !Config.usingCubes;
			Settings.refresh();
		}
	})
}


export default addControls;