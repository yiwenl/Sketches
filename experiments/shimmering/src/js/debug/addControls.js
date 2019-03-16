// addControls.js

import Settings from '../Settings';
import Config from '../Config';

const addControls = (scene) => {

	setTimeout(()=> {
		console.log(Config.flocking);
		gui.add(Config, 'numParticles', 10, 256).step(1).onFinishChange(Settings.reload);	
		gui.add(Config, 'maxRadius', 1, 20).onChange(Settings.refresh);	
		gui.add(Config.flocking, 'uRadius', 0, 4).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uMinThreshold', 0, .5).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uMaxThreshold', .5, 1).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uForce', 0, 3).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uAttractForce', 0, 3).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uRepelForce', 0, 3).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uAlignForce', 0, 3).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uMaxSpeed', 0, 3).onChange(Settings.refresh);
		gui.add(Config.flocking, 'uNoiseForce', 0, 5).onChange(Settings.refresh);
	}, 500);
	
}


export default addControls;