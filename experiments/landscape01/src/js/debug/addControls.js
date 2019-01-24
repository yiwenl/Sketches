// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'floorSize', 1, 20).onFinishChange(Settings.reload);
		gui.add(Config, 'mountainHeight', 0, 2).onFinishChange(Settings.refresh);
		gui.add(Config, 'mountainScale', 0, 2).onFinishChange(Settings.refresh);
		gui.add(Config, 'numMountains', 1, 50).onFinishChange(Settings.reload);
		gui.add(Config, 'numSlices', 10, 150).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'noiseScale', 1, 20).onFinishChange(Settings.reload);
		gui.add(Config, 'misOffset', 0, 1).onFinishChange(Settings.refresh);
		gui.add(Config, 'fogMovingSpeed', 0, 1).onFinishChange(Settings.refresh);
	}, 200);
}


export default addControls;