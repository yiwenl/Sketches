// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Config, 'shadowPrec', 0, 10).onChange(Settings.refresh);
		gui.add(Config, 'shadowSpread', 0, 100).onChange(Settings.refresh);
	}, 200);
}


export default addControls;