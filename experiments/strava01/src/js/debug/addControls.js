// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'heightScale', 0, 2).onFinishChange(Settings.refresh);
		gui.add(Config, 'mapScale', 1, 500).onFinishChange(Settings.refresh);
		gui.add(Settings, 'reset').name('Reset Default');
	}, 200);
}


export default addControls;