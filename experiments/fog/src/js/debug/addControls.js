// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'numLights', 1, 15).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'numSlices', 1, 100).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'noiseScale', 1, 30).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'floorSize', 1, 10).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'fogOffset', 0, 1).onChange(Settings.refresh);
		gui.add(Config, 'fogMovingSpeed', 0, 5).onChange(Settings.refresh);
		gui.add(Config, 'lightIntensity', 0, 1).onChange(Settings.refresh);
	}, 200);
}


export default addControls;