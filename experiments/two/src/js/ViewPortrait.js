// ViewPortrail.js

import alfrid, { GL } from 'alfrid';


const ratio = 449/600;

class ViewPortrait extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		const num = 10;
		const width = 5;
		const height = width / ratio;
		this.mesh = alfrid.Geom.plane(width, height, num);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uRatio", "float", ratio);
		GL.draw(this.mesh);
	}


}

export default ViewPortrait;