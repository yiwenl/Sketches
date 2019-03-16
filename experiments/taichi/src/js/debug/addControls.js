// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'threshold', 0, 10).onChange(Settings.refresh);
		gui.add(Config, 'numParticles', 256, 1024).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'maxRadius', 1, 5).onChange(Settings.refresh);
		gui.add(Config, 'randomness', 0, 1).onChange(Settings.refresh);
	}, 200);
}


export default addControls;