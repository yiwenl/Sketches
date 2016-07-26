// ViewHit.js

import alfrid, { GL } from 'alfrid';

class ViewHit extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		const size = params.numTiles * params.grassRange * 3.0;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewHit;