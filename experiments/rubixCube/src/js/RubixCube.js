// RubixCube.js

import Cube from './Cube';


import { 
	selectTop,
	selectBottom,
	selectLeft,
	selectRight,
	selectFront,
	selectBack
} from './utils';

const X_AXIS = vec3.fromValues(1, 0, 0);
const Y_AXIS = vec3.fromValues(0, 1, 0);
const Z_AXIS = vec3.fromValues(0, 0, 1);
const LOCK_DURATION = 650;

class RubixCube {

	constructor() {
		this._cubes = [];


		for(let i=-1; i<=1; i++) {
			for(let j=-1; j<=1; j++) {
				for(let k=-1; k<=1; k++) {
					const c = new Cube([i, j, k]);

					this._cubes.push(c);
				}
			}
		}

		this._steps = [];

		this._isLocked = false;
		this._isSolving = false;
	}


	solve() {
		this._isSolving = true;
		const move = this._steps.pop();
		this[`rotate${move.face}`](-move.angle, true);

		this._cubes.forEach( c => {
			c.speed = 0.05;
			c.easing = 'cubicOut';
		});

		if(this._steps.length > 0) {
			setTimeout(()=>this.solve(), 300);
		} else {
			this._isSolving = false; 
			this._cubes.forEach( c => {
				c.speed = 0.02;
				c.easing = 'expInOut';
			});
		}
	}


	tempLock() {
		if(!this._isSolving) {
			this._isLocked = true;
			setTimeout(()=> {
				this._isLocked = false;
			}, LOCK_DURATION);	
		}
	}


	rotateTop(mAngle=Math.PI/2, mIsSolving=false) {
		if(this._isLocked ) {	return;	}
		if(!mIsSolving) {
			this._steps.push({
				angle:mAngle,
				face:'Top'
			});

		}
		this.top.forEach( c => c.rotateAnim(Y_AXIS, mAngle));
		this.tempLock();
	}

	rotateBottom(mAngle=Math.PI/2, mIsSolving=false) {
		if(this._isLocked) {	return;	}
		if(!mIsSolving) {
			this._steps.push({
				angle:mAngle,
				face:'Bottom'
			});

		}
		this.bottom.forEach( c => c.rotateAnim(Y_AXIS, mAngle));
		this.tempLock();
	}

	rotateRight(mAngle=Math.PI/2, mIsSolving=false) {
		if(this._isLocked) {	return;	}
		if(!mIsSolving) {
			this._steps.push({
				angle:mAngle,
				face:'Right'
			});

		}
		this.right.forEach( c => c.rotateAnim(X_AXIS, mAngle));
		this.tempLock();
	}

	rotateLeft(mAngle=Math.PI/2, mIsSolving=false) {
		if(this._isLocked) {	return;	}
		if(!mIsSolving) {
			this._steps.push({
				angle:mAngle,
				face:'Left'
			});

		}
		this.left.forEach( c => c.rotateAnim(X_AXIS, mAngle));
		this.tempLock();
	}

	rotateFront(mAngle=Math.PI/2, mIsSolving=false) {
		if(this._isLocked) {	return;	}
		if(!mIsSolving) {
			this._steps.push({
				angle:mAngle,
				face:'Front'
			});

		}
		this.front.forEach( c => c.rotateAnim(Z_AXIS, mAngle));
		this.tempLock();
	}

	rotateBack(mAngle=Math.PI/2, mIsSolving=false) {
		if(this._isLocked) {	return;	}
		if(!mIsSolving) {
			this._steps.push({
				angle:mAngle,
				face:'Back'
			});

		}
		this.back.forEach( c => c.rotateAnim(Z_AXIS, mAngle));
		this.tempLock();
	}


	render() {
		this._cubes.forEach( cube => cube.render() );
	}

	get isSolving() {	return this._isSolving;	}

	get top() {	return selectTop(this._cubes);	}
	get bottom() {	return selectBottom(this._cubes);	}
	get left() {	return selectLeft(this._cubes);	}
	get right() {	return selectRight(this._cubes);	}
	get front() {	return selectFront(this._cubes);	}
	get back() {	return selectBack(this._cubes);	}
}

export default RubixCube;