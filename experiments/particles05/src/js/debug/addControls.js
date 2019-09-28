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
		gui.add(Config, 'numParticles', 10, 1024).step(1).onFinishChange(Settings.reload);	
		gui.add(Config, 'numSets', 1, 5).step(1).onFinishChange(Settings.reload);	
		gui.add(oControl, 'save').name('Save Settings');
		gui.add(Settings, 'reset').name('Reset Default');

		gui.add(Config, 'ssaoSamples', 4, 12).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'ssaoRings', 3, 9).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'aoStrength', 0, 1).onFinishChange(Settings.refresh);
	}, 500);
	
}


export default addControls;