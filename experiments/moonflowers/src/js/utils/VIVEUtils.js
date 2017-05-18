// VIVEUtils.js

let count = 0;

class VIVEUtils {
	constructor() {
		this._vrDisplay;
		this._frameData;
		this.id = 'ID' + count ++;
		this._gamePads = [];
		this.hasVR = false;
		this.vrPresenting = false;

		// console.log(this.id);
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

				// console.log('VR display : ', vrDisplay, vrDisplay.capabilities.canPresent);
				if (vrDisplay.capabilities.canPresent) {
					// let btnVR = document.body.querySelector('.button_vr');
					// btnVR.style.display = 'block';
					// btnVR.addEventListener('click', onVRRequestPresent);

					// window.addEventListener('vrdisplaypresentchange', onVRPresentChange, false);
					// window.addEventListener('vrdisplayactivate', onVRRequestPresent, false);
					// window.addEventListener('vrdisplaydeactivate', onVRExitPresent, false);
				}

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
			this.vrPresenting = true;

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
			// console.log('No VR Headset detected');
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

}

let instance;

if(instance === undefined) {
	instance = new VIVEUtils();
}

export default instance;
