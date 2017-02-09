// Ball.js

import alfrid from 'alfrid';

class Ball {

	constructor() {
		this._offset   = new alfrid.TweenNumber(0, 'cubicOut', 0.04);
		this._position = vec3.create();
		this._start    = vec3.fromValues(-999, -999, -999);
		this._end      = vec3.fromValues(-999, -999, -999);
	}


	launch(mStart, mEnd) {
		vec3.copy(this._start, mStart);
		vec3.copy(this._end, mEnd);
		this._offset.setTo(0);
		this._offset.value = 1;
		this._curveOffset = 1.0 + Math.random();
	}


	get position() {
		vec3.lerp(this._position, this._start, this._end, this._offset.value);
		this._position[1] += Math.sin(this._offset.value * Math.PI) * this._curveOffset;
		return this._position;
	}
}


export default Ball;