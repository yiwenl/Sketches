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
		gui.add(Config, 'roughness', 0, 1).onFinishChange(Settings.refresh);
		gui.add(Config, 'metallic', 0, 1).onFinishChange(Settings.refresh);
		gui.add(oControl, 'save').name('Save Settings');
		gui.add(Settings, 'reset').name('Reset Default');
	}, 200);
}


export default addControls;