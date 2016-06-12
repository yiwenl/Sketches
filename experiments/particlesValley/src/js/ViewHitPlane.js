// ViewHitPlane.js

import alfrid, { GL } from 'alfrid';

class ViewHitPlane extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		const size = 16;
		this.mesh = alfrid.Geom.plane(size, size * 2, 1, 'xz');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewHitPlane;