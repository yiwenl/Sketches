// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'noiseScale', 0, 15).onChange(Settings.refresh);
		gui.add(Config, 'noise', 0, 1).onFinishChange(Settings.refresh);
		// gui.add(Config, 'roughness', 0, 1).onFinishChange(Settings.refresh);
		// gui.add(Config, 'metallic', 0, 1).onFinishChange(Settings.refresh);
		gui.add(Config, 'fadeOutRate', .8, 1).onChange(Settings.refresh);
		gui.add(Config, 'spread', .9, 1).onChange(Settings.refresh);
		gui.add(Config, 'floorSize', 1, 10).onFinishChange(Settings.reload);
	}, 200);
}


export default addControls;