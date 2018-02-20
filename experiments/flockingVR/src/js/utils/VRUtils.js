// VRUtils.js

import Gamepad from './Gamepad';

let count = 0;

class VRUtils {
	constructor() {
		this._vrDisplay;
		this._frameData;
		this.id = 'ID' + count ++;
		this._gamePads = [];
		this.hasVR = false;
		this.isPresenting = false;

		this._rightHandpad;
		this._leftHandpad;
	}


	init(mCallback) {
		if(!navigator.getVRDisplays) {
			mCallback(null);
			return;
		}


		navigator.getVRDisplays().then((displays) => {
			if (displays.length > 0) {
				const vrDisplay = displays[0];
				this._vrDisplay = vrDisplay;
				this._frameData = new VRFrameData();

				this.hasVR = true;

				mCallback(vrDisplay);
			} else {
				mCallback(null);
			}
		});
	}


	present(mCanvas, callback) {
		if(!this._vrDisplay) {
			console.log('No VR Headset detected');
			return;
		}

		if(!this._vrDisplay.capabilities.canPresent) {
			console.warn("Can't present");
			return;
		}

		this._vrDisplay.requestPresent([{ source: mCanvas }]).then( () => {
			console.log(' on request VR ', window.innerWidth, window.innerHeight);
			this.isPresenting = true;

			if(callback) {
				callback();
			}
		}, () => {
			console.debug("requestPresent failed.");
		});
	}


	submitFrame() {
		if(this._vrDisplay.isPresenting) {
			this._vrDisplay.submitFrame();
		}
	}

	getFrameData() {
		if(!this._vrDisplay) {
			return;
		}

		this._vrDisplay.getFrameData(this._frameData);
		this._checkGamepads();

		return this._frameData;
	}


	setCamera(mCamera, mDir) {
		const projection = this._frameData[`${mDir}ProjectionMatrix`];
		const matrix = this._frameData[`${mDir}ViewMatrix`];

		mat4.copy(mCamera.matrix, matrix);
		mat4.copy(mCamera.projection, projection);
	}

	_checkGamepads() {
		if(!navigator.getGamepads) {
			return;
		}
		const gamepads = navigator.getGamepads();
		let count = 0;

		

		for(let i=0; i<gamepads.length; i++) {

			if(!this._gamePads[i]) {
				const gamepad = new Gamepad();
				this._gamePads[i] = gamepad;
			}
			const gamepadData = gamepads[i]
			this._gamePads[i].update(gamepadData);


			if(gamepadData && gamepadData.pose) {
				if(!gamepadData.pose.position) continue;

				const o = {
					position:gamepadData.pose.position,
					orientation:gamepadData.pose.orientation,
					buttons:gamepadData.buttons,
					hand:gamepadData.hand
				}

				// this._gamePads.push(o);
				count ++;
			}
		}

	}


	get gamePads() {
		return this._gamePads;
	}


	get vrDisplay() {
		return this._vrDisplay;
	}

	get canPresent() {
		if(!this._vrDisplay) {
			return false;
		}
		return this._vrDisplay.capabilities.canPresent;
	}


	get leftHand() {
		if(!this._leftHandpad) {
			const pads = this._gamePads.filter(pad => pad.hand === 'left');
			if(pads.length == 0) {
				return null;
			}

			this._leftHandpad = pads[0];
		}

		return this._leftHandpad;
	}


	get rightHand() {
		if(!this._rightHandpad) {
			const pads = this._gamePads.filter(pad => pad.hand === 'right');

			if(pads.length == 0) {
				return null;
			}

			this._rightHandpad = pads[0];
		}

		return this._rightHandpad;
	}


}

let instance;

if(instance === undefined) {
	instance = new VRUtils();
}

export default instance;
