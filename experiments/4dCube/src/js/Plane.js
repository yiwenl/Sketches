import alfrid, { GL } from 'alfrid';

import vs from 'shaders/plane.vert';
import fs from 'shaders/plane.frag';

class Plane extends alfrid.View {
	
	constructor(mNormal = [1, 1, 1], mDistance = 0) {
		super(vs, fs);
		this.normal = mNormal;
		this.distance = mDistance;
		this._tmp = this.normal.concat(this.distance);

		gui.add(this, 'x', -1, 1);
		gui.add(this, 'y', -1, 1);
		gui.add(this, 'z', -1, 1);
		gui.add(this, 'distance', 0, 3);
	}


	_init() {
		const size = 2;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xy');
	}

	update() {
		this._tmp = this.normal.concat(this.distance);
	}


	render(plane, dimension) {
		this.shader.bind();
		this.shader.uniform(params.light);
		this.shader.uniform("uPlane", "vec4", plane);
		this.shader.uniform("uDimension", "vec3", dimension);

		GL.disable(GL.CULL_FACE);
		GL.draw(this.mesh);
		GL.enable(GL.CULL_FACE);
	}


	get x() { return this.normal[0]; }
	set x(value) { this.normal[0] = value; }

	get y() { return this.normal[1]; }
	set y(value) { this.normal[1] = value; }

	get z() { return this.normal[2]; }
	set z(value) { this.normal[2] = value; }


	get plane() {
		return this._tmp;
	}
}

export default Plane;