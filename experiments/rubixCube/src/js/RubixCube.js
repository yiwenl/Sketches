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
		const mtx = mat4.create();
		mat4.rotateY(mtx, mtx, mAngle);
		this.top.forEach( c => c.rotate(mtx) );
	}

	rotateBottom(mAngle=Math.PI/2) {
		const mtx = mat4.create();
		mat4.rotateY(mtx, mtx, mAngle);
		this.bottom.forEach( c => c.rotate(mtx) );
	}


	rotateRight(mAngle=Math.PI/2) {
		const mtx = mat4.create();
		mat4.rotateX(mtx, mtx, mAngle);
		this.right.forEach( c => c.rotate(mtx) );
	}

	rotateLeft(mAngle=Math.PI/2) {
		const mtx = mat4.create();
		mat4.rotateX(mtx, mtx, mAngle);
		this.left.forEach( c => c.rotate(mtx) );
	}


	rotateFront(mAngle=Math.PI/2) {
		const mtx = mat4.create();
		mat4.rotateZ(mtx, mtx, mAngle);
		this.front.forEach( c => c.rotate(mtx) );
	}


	rotateBack(mAngle=Math.PI/2) {
		const mtx = mat4.create();
		mat4.rotateZ(mtx, mtx, mAngle);
		this.back.forEach( c => c.rotate(mtx) );
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