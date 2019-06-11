// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'numParticles', 10, 1024).step(1).onFinishChange(Settings.reload);	

		const ranges = [161,193,257,289,321,353,385,417,449,481,513,801];
		gui.add(Config, 'ResNetInputResolution', ranges).onFinishChange(Settings.reload);

		const checkTracking = () => {

			if(document.body.classList.contains('hidePose')) {
				document.body.classList.remove('hidePose');
			}

			if(Config.hideTracking) {
				document.body.classList.add('hidePose');
			}
			Settings.refresh();
		}

		gui.add(Config, 'hideTracking').onFinishChange(checkTracking);

		checkTracking();
	}, 200);
	
}


export default addControls;