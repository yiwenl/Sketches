// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Settings, 'reset').name('Reset Default');
	}, 200);
}


export default addControls;