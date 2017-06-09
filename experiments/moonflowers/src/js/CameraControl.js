// CameraControl.js

import VIVEUtils from './utils/VIVEUtils';
import alfrid, { GL } from 'alfrid';

import TouchOrientationControl from './cameraControls/TouchOrientationControl';
import DeviceOrientationControl from './cameraControls/DeviceOrientationControl';

// const getCameraControl = function() {

// }


// class

let control;

const getCameraControl = function(camera, listenerTarget) {

	if(VIVEUtils.canPresent) {
		//	return VIVECameraControl
	} else {
		if(GL.isMobile) {
			console.log('Using device orentation control');
			control = new DeviceOrientationControl(camera, listenerTarget);
		} else {
			// console.log('Using touch orientation control');
			control = new TouchOrientationControl(camera, listenerTarget);
		}
	}

	return control;
}


export default getCameraControl;