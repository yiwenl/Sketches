// DeviceOrientationControl.js

const RAD = function(degree) {
	return degree * Math.PI / 180;
}

class DeviceOrientationControl {
	constructor(mCamera) {
		this._camera = mCamera;
		this._rotation = mat4.create();

		this._hasSet = false;
		this._alpha = 0;
		this._beta = 0;
		this._gamma = 0;
		this.easing = 0.15;

		this._init();
		this.connect();

		this._screenRotation = 0;
		this._isLocked = false;
	}

	lock(mValue) {
		this._isLocked = mValue;
		if(this._isLocked) {
			this.disconnect();
		} else {
			this.connect();
		}
	}

	_init() {
		this.enabled = true;

		this.deviceOrientation = {};
		this.screenOrientation = 0;

		this.alphaOffsetAngle = 90;

		this.onScreenOrientationChangeBind = (e) => this._onScreenOrientationChange(e);
		this.onDeviceOrientationChangeBind = (e) => this._onDeviceOrientationChange(e);
	}


	connect() {
		this.onScreenOrientationChangeBind();

		window.addEventListener( 'orientationchange', this.onScreenOrientationChangeBind, false );
		window.addEventListener( 'deviceorientation', this.onDeviceOrientationChangeBind, false );

		this.enabled = true;
	}


	disconnect() {

		window.removeEventListener( 'orientationchange', this.onScreenOrientationChangeBind, false );
		window.removeEventListener( 'deviceorientation', this.onDeviceOrientationChangeBind, false );
		this.enabled = false;
	}


	update() {
		this.alphaOffsetAngle = this.screenOrientation;
		let alpha = this.deviceOrientation.alpha ? RAD(this.deviceOrientation.alpha + this.alphaOffsetAngle) : 0;
		let beta = this.deviceOrientation.beta ? RAD(this.deviceOrientation.beta) : 0;
		let gamma = this.deviceOrientation.gamma ? RAD(this.deviceOrientation.gamma) : 0;
		let orient = this.screenOrientation ? RAD(this.screenOrientation) : 0;

		const degree = 180 / Math.PI;
		


		let sign = beta > 0 ? 1 : -1;
		let angle;
		if(gamma > 0) {
			angle = beta;
		} else {
			if(beta < 0) {
				angle = -(Math.PI + beta);	
			} else {
				angle = Math.PI - beta;	
			}
			
		}

		if(orient > 0) {
			if(sign < 0) {
				angle = Math.PI + angle;
			} else {
				angle = angle - Math.PI;
			}
		}

		this._screenRotation = angle;


		if(!this._hasSet) {
			this._alpha = alpha;
			this._beta = beta;
			this._gamma = gamma;
		} else {
			this._alpha += (alpha - this._alpha) * this.easing;
			this._beta += (beta - this._beta) * this.easing;
			this._gamma += (gamma - this._gamma) * this.easing;
		}

		this.setObjectQuaternion(this._alpha, this._beta, this._gamma, orient);
	}


	setObjectQuaternion(alpha, beta, gamma, orient) {
		let q = quat.create();
		let zee  = vec3.create();
		let q0 = quat.create();
		let q1 = quat.create();
		zee[2] = 1;
		
		//YXZ
		let euler = {
			x: beta,
			y: alpha,
			z: -gamma
		};

		var c1 = Math.cos( euler.x / 2 );
		var c2 = Math.cos( euler.y / 2 );
		var c3 = Math.cos( euler.z / 2 );
		var s1 = Math.sin( euler.x / 2 );
		var s2 = Math.sin( euler.y / 2 );
		var s3 = Math.sin( euler.z / 2 );

		let x = s1 * c2 * c3 + c1 * s2 * s3;
		let y = c1 * s2 * c3 - s1 * c2 * s3;
		let z = c1 * c2 * s3 - s1 * s2 * c3;
		let w = c1 * c2 * c3 + s1 * s2 * s3;

		quat.set(q, x,y,z,w);
		quat.set(q1, Math.sqrt( 0.5 ), 0, 0, -Math.sqrt( 0.5 ));
		quat.setAxisAngle(q0, zee, -orient);

		quat.multiply(q, q, q1);
		quat.multiply(q, q, q0);

		quat.invert(q,q);
		mat4.fromQuat(this._camera._mtxView, q);
		mat4.fromQuat(this._rotation, q);
		mat4.invert(this._camera._mtxInvertView, this._camera._mtxView);
	}


	//	Event handlers

	_onScreenOrientationChange(e) {
		this.screenOrientation = window.orientation || 0;
	}

	_onDeviceOrientationChange(e) {
		this.deviceOrientation = event;
	}


	get rotation() {	return this._rotation;	}

	get uiOrientation() {	return this._screenRotation;	}

}


export default DeviceOrientationControl;
