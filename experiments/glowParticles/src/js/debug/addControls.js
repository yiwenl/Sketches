// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'numParticles', 10, 1024).step(1).onFinishChange(Settings.reload);	
		gui.add(Config, 'pillarRadius', 1, 5).onFinishChange(Settings.reload);
		gui.add(Config, 'pillarHeight', 1, 10).onFinishChange(Settings.reload);
		gui.add(Config, 'skipCount', 1, 10).step(1).onFinishChange(Settings.reload);
	}, 500);
	
};


export default addControls;