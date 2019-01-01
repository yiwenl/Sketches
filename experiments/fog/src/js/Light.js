// Light.js

class Light {
	constructor(mOrigin, mDir, mColor=[1, 1, 1]) {
		this.origin = mOrigin;
		this.dir    = mDir;
		vec3.normalize(this.dir, this.dir);
		this.target = vec3.clone(this.dir);
		vec3.scale(this.target, this.target, 7);
		vec3.add(this.target, this.origin, this.target);
		this.color  = mColor;
	}

}

export default Light;