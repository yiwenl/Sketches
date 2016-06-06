// ViewMountains.js

import alfrid, { GL } from 'alfrid';

class ViewMountains extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		this.mesh;
	}


	addMountain(mPosition) {
		
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}

}

export default ViewMountains;