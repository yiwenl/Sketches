// VRUtils.js

class VRUtils {
	constructor() {
		this._vrHMD;
		this._vrInput;
	}


	getVRDevices(callback) {

		if(!navigator.getVRDevices) {
			callback(null);
			return;
		}

		navigator.getVRDevices()
		.then((devices)=> {
			for(let i=0; i<devices.length; i++) {
				if ( devices[ i ] instanceof HMDVRDevice ) {
					this._vrHMD = devices[i];
					this.eyeParamsL = this._vrHMD.getEyeParameters( 'left' );
					this.eyeParamsR = this._vrHMD.getEyeParameters( 'right' );
					this.eyeTranslationL = this.eyeParamsL.eyeTranslation;
					this.eyeTranslationR = this.eyeParamsR.eyeTranslation;
					this.eyeFOVL = this.eyeParamsL.recommendedFieldOfView;
					this.eyeFOVR = this.eyeParamsR.recommendedFieldOfView;
				} else if( devices[i] instanceof PositionSensorVRDevice) {
					this._vrInput = devices[i];
				}
			}
			callback(this._vrHMD);
		}).catch((e)=> {
			callback(null);
		});

	}

	fullscreen(el) {
		if(!this._vrHMD) {	return;	}

		if ( el.mozRequestFullScreen ) {

			el.mozRequestFullScreen( { vrDisplay: this._vrHMD } );

		} else if ( canvas.webkitRequestFullscreen ) {

			el.webkitRequestFullscreen( { vrDisplay: this._vrHMD } );

		}
	}


	getOrientation() {
		if(!this._vrHMD) {	return null;	}	

		const state = this._vrInput.getState();
		if(!state || !state.orientation) return;

		const {x, y, z, w} = state.orientation;
		return {x, y, z, w:-w};
	}

	get vrHMD() {	return this._vrHMD;	}
	get vrInput() {	return this._vrInput;	}
}

const utils = new VRUtils();

export default utils;