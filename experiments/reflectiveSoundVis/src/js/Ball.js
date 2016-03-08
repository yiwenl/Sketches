// Ball.js

var random = function(min, max) { return min + Math.random() * (max - min);	}

class Ball {
	constructor() {
		let range     = 2;
		this.position = vec3.clone([random(-range, range), random(-range, range), random(-range, range)]);
		this.orgPosition = vec3.clone(this.position);
		this.scale    = random(.25, 1);
		this.axis     = vec3.fromValues(random(-1, 1), random(-1, 1), random(-1, 1));
		vec3.normalize(this.axis, this.axis);
		
		this.speed    = random(-1, 1) * .01;
		this.angle    = Math.random() * Math.PI;
		this.quat 	  = quat.create();
	}


	update() {
		this.angle += this.speed;

		quat.setAxisAngle(this.quat, this.axis, this.angle);
		vec3.transformQuat(this.position, this.orgPosition, this.quat);
	}
}


export default Ball;