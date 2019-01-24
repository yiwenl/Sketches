// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	// setTimeout(()=> {
		gui.add(Config, 'roughness', 0, 1).onFinishChange(Settings.refresh);
		gui.add(Config, 'metallic', 0, 1).onFinishChange(Settings.refresh);
	// }, 200);
}


export default addControls;