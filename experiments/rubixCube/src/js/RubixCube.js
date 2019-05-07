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


		setTimeout(()=> {
			gui.add(this, 'rotateTop');
			gui.add(this, 'rotateBottom');
			gui.add(this, 'rotateRight');
			gui.add(this, 'rotateLeft');
			gui.add(this, 'rotateFront');
			gui.add(this, 'rotateBack');
		}, 500);
	}


	rotateTop(mAngle=Math.PI/2) {
		this.top.forEach( c => c.rotateAnim(Y_AXIS, mAngle));
	}

	rotateBottom(mAngle=Math.PI/2) {
		this.bottom.forEach( c => c.rotateAnim(Y_AXIS, mAngle));
	}


	rotateRight(mAngle=Math.PI/2) {
		this.right.forEach( c => c.rotateAnim(X_AXIS, mAngle));
	}

	rotateLeft(mAngle=Math.PI/2) {
		this.left.forEach( c => c.rotateAnim(X_AXIS, mAngle));
	}


	rotateFront(mAngle=Math.PI/2) {
		this.front.forEach( c => c.rotateAnim(Z_AXIS, mAngle));
	}


	rotateBack(mAngle=Math.PI/2) {
		this.back.forEach( c => c.rotateAnim(Z_AXIS, mAngle));
	}




	render() {
		this._cubes.forEach( cube => cube.render() );
	}


	get top() {	return selectTop(this._cubes);	}
	get bottom() {	return selectBottom(this._cubes);	}
	get left() {	return selectLeft(this._cubes);	}
	get right() {	return selectRight(this._cubes);	}
	get front() {	return selectFront(this._cubes);	}
	get back() {	return selectBack(this._cubes);	}
}

export default RubixCube;