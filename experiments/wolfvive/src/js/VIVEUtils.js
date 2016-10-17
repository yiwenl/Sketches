// VIVEUtils.js

let count = 0;

class VIVEUtils {
	constructor() {
		this._vrDisplay;
		this._frameData;
		this.id = 'ID' + count ++;

		console.log(this.id);
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


	present(mCanvas) {
		if(!this._vrDisplay) {
			console.log('No VR Headset detected');
			return;
		}

		if(!this._vrDisplay.capabilities.canPresent) {
			console.warn("Can't present");
			return;
		}

		this._vrDisplay.requestPresent([{ source: mCanvas }]).then( () => {
			console.log(' on request VR ');
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
		return this._frameData;
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