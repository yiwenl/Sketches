// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'numParticles', 10, 1024).step(1).onFinishChange(Settings.reload);	
		gui.add(Settings, 'reset');	
	}, 500);
	
}


export default addControls;