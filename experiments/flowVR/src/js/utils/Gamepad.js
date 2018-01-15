// Gamepad.js

import alfrid from 'alfrid';
import States from 'object-states';

const FRONT = vec3.fromValues(0, 0, -1);

class Gamepad extends alfrid.EventDispatcher {
	constructor() {
		super();
		this.pulsing = true;
		this.pulseStrength = 2;

		this.mtx = mat4.create();

		this._buttons = new States({mainPressed:false, triggerPressed:false, button3Pressed:false, button4Pressed:false});

		this._buttons.mainPressed.onChange( o => this._onMainButtonTrigger(o));
		this._buttons.triggerPressed.onChange( o => this._onTrigger(o));
		this._buttons.button3Pressed.onChange( o => this._onButton3Trigger(o));
		this._buttons.button4Pressed.onChange( o => this._onButton4Trigger(o));
		this.dir = vec3.create();

		this.buttonState = [false, false, false, false];
	}


	update(mData) {
		this.position = mData.pose.position;
		this.orientation = mData.pose.orientation;
		this.buttons = mData.buttons;
		this.hand = mData.hand;
		mat4.fromRotationTranslation(this.mtx, this.orientation, this.position);
		vec3.transformQuat(this.dir, FRONT, this.orientation);

		if(mData.hapticActuators.length == 0) {
			this.pulsing = false;
		}

		if(this.buttons[1].pressed && this.pulsing) {
			mData.hapticActuators[0].pulse(0.1, this.pulseStrength);
		}		

		this.buttonState = this.buttons.map( button => button.pressed );
		this._buttons.setState({
			mainPressed:this.buttonState[0],
			triggerPressed:this.buttonState[1],
			button3Pressed:this.buttonState[2],
			button4Pressed:this.buttonState[3]
		});


		if(this.buttonState[0]) {
			this.dispatchCustomEvent('mainButtonDown');
		}

		if(this.buttonState[1]) {
			this.dispatchCustomEvent('triggerDown');
		}
	}


	_onTrigger(o) {
		const eventName = o ? 'triggerPressed' : 'triggerReleased';
		this.dispatchCustomEvent(eventName, {pressed:o});
	}


	_onMainButtonTrigger(o) {
		const eventName = o ? 'mainButtonPressed' : 'mainButtonReleased';
		this.dispatchCustomEvent(eventName, {pressed:o});
	}


	_onButton3Trigger(o) {
		console.log('button3 trigger');
		const eventName = o ? 'button3Pressed' : 'button3Released';
		this.dispatchCustomEvent(eventName, {pressed:o});
	}

	_onButton4Trigger(o) {
		console.log('button4 trigger');
		const eventName = o ? 'button4Pressed' : 'button4Released';
		this.dispatchCustomEvent(eventName, {pressed:o});
	}


	get isMainButtonPressed() {
		return this.buttonState[0];
	}

	get isTriggerPressed() {
		return this.buttonState[1];
	}
}


export default Gamepad;