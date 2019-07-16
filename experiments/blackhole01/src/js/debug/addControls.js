// addControls.js

import Settings from '../Settings';
import Config from '../Config';
import FlowControl from '../FlowControl';
import alfrid from 'alfrid';
import Time from '../Time';
import dat from 'dat-gui';

import hexRgb from 'hex-rgb';

const checkColor = (obj, id) => {
	if(obj[id].indexOf('#') > -1) {
		const oColor = hexRgb(obj[id]);
		obj[id] = [oColor.red, oColor.green, oColor.blue];	
	}
	Settings.refresh();
}

const addControls = (scene) => {
	setTimeout(()=> {
		gui.add(Time, 'frame').listen();
		gui.add(Config, 'progress').listen();
		// gui.add(alfrid.Scheduler, 'deltaTime').name('Time').listen();
		gui.add(Config, 'numParticles', 10, 1024).step(1).onFinishChange(Settings.reload);	
		gui.add(Config, 'numParticleSets', 1, 10).step(1).onFinishChange(Settings.reload);	
		gui.add(Config, 'fps', 1, 30).step(1).onFinishChange(Settings.reload);	
		gui.add(Config, 'targetFps', [60, 30]).name('output fps').onFinishChange(Settings.reload);	


		// gui.add(Config, 'ringSize', 0, 4).onFinishChange(Settings.reload);
		gui.add(Config, 'fadeOutOffset', 0, 2).onFinishChange(Settings.refresh);
		gui.add(Config, 'ringRadius', 1, 18).onFinishChange(Settings.reload);
		gui.add(Config, 'burstForce', 0, 5).onFinishChange(Settings.refresh);
/*
		
		
		gui.add(Config, 'zOffset', 1, 4).onFinishChange(Settings.reload);

		const sources = [
			'nebula1',
			'nebula2',
			'nebula3',
			'nebula4',
			'nebula5',
		]
		gui.add(Config, 'image', sources).onFinishChange(Settings.reload);
*/		
		
		// gui.add(Config, 'showDimensions').onFinishChange(Settings.refresh);

		const oControl = {
			reset:()=> {
				window.location.href = window.location.origin+window.location.pathname
			}
		}

		
		
/*		
		
		gui.add(Config, 'backgroundOpacity', 0, 1).onChange(Settings.refresh);
		gui.add(Config, 'fadeRange', 0, 1).onFinishChange(Settings.refresh);

		gui.add(Config, 'centred').onChange(checkCentred);
*/

		const checkCentred = () => {
			console.log(Config.centred);

			if(Config.centred) {
				scene.resize(window.innerWidth, window.innerHeight);
			} else {
				scene.resize();
			}

			Settings.refresh();
		}

		// gui.add(Config, 'lineWidth', 0, 3).onFinishChange(Settings.refresh);
		// gui.addColor(Config, 'lineColor').onChange(() => {
		// 	checkColor(Config, 'lineColor');
		// });	
		

		// gui.add(Config, 'showLines').onFinishChange(Settings.refresh);
		// gui.add(Config, 'showParticles').onFinishChange(Settings.refresh);
		// gui.add(Config, 'showCenterBall').onFinishChange(Settings.refresh);
		

		const updateLight = () => {
			scene.updateLight()
			Settings.refresh();
		}


		gui.add(Config, 'particleContrast', 1, 5).onChange(Settings.refresh);
		gui.add(Config, 'particleScale', 1, 3).onFinishChange(Settings.refresh);
		
		gui.add(Config, 'lightX', -10, 10).onChange(updateLight);
		gui.add(Config, 'lightY', 0, 10).onChange(updateLight);
		gui.add(Config, 'lightZ', 0, 10).onChange(updateLight);
/*/		
		
		gui.add(Config, 'pullingForce', 0, 3).onFinishChange(Settings.refresh);

		gui.add(Config, 'numTrailSets', 1, 5).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'trailLength', 2, 14).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'numTrails', 1, 256).step(1).onFinishChange(Settings.reload);
		gui.add(Config, 'bloomStrength', 0, 1).onFinishChange(Settings.refresh);
		gui.add(Config, 'gradientMap', 0, 1).onFinishChange(Settings.refresh);	
//*/	

		// gui.add(Config, 'radius', 0, 1).onFinishChange(Settings.refresh);
		// gui.add(Config, 'distance', 0, 10).onFinishChange(Settings.refresh);

		// gui.add(FlowControl, 'start');
		

		gui.add(Config, 'exportFrame').onFinishChange(Settings.reload);
		gui.add(Config, 'fullscaleCanvas').onFinishChange(Settings.reload);
		gui.add(Config, 'debugVisual').onFinishChange(Settings.reload);
		gui.add(scene, 'start');
		// gui.add(FlowControl, 'end');
		
		gui.add(scene, 'pause');
		gui.add(scene, 'resume');
		// scene.start();

		gui.add(oControl, 'reset').name('Reset Default');



		checkCentred();

		//	key bindings
		window.addEventListener('keydown', (e) => {
			// console.log('on key :', e.keyCode);

			if(e.keyCode === 84) {
				Config.showDimensions = !Config.showDimensions;
			}

			if(e.keyCode === 76) {	//	s
				scene.loop();
			}
			if(e.keyCode === 83) {	//	s
				scene.start();
			}

			if(e.keyCode === 69) {	//	s
				FlowControl.end();
			}

			Settings.refresh();
		});

	}, 500);
	
}


export default addControls;