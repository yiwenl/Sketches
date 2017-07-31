// VRUtils.js

let count = 0;

class VRUtils {
	constructor() {
		this._vrDisplay;
		this._frameData;
		this.id = 'ID' + count ++;
		this._gamePads = [];
		this.hasVR = false;
		this.isPresenting = false;
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

		this._gamePads = [];

		for(let i=0; i<gamepads.length; i++) {
			const gamepad = gamepads[i]

			if(gamepad && gamepad.pose) {
				if(!gamepad.pose.position) continue;

				const o = {
					position:gamepad.pose.position,
					orientation:gamepad.pose.orientation,
					buttons:gamepad.buttons
				}

				this._gamePads.push(o);
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
}

let instance;

if(instance === undefined) {
	instance = new VRUtils();
}

export default instance;
