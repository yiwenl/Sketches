// ViewBox.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/box.vert';

class ViewBox extends alfrid.View {
	
	constructor() {
		super(vs);

		this.w = 2;
		this.h = 5.5;
		this.d = 2;

		this.y = 5.5;

		// gui.add(this, 'w', 0, 2);
		// gui.add(this, 'h', 0, 6);
		// gui.add(this, 'd', 0, 2);
		// gui.add(this, 'y', 0, 6);
	}


	_init() {
		this.mesh = alfrid.Geom.cube(2, 2, 2);

		
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uScale", "vec3", [this.w, this.h, this.d]);
		this.shader.uniform("uOffset", "float", this.y);
		GL.draw(this.mesh);
	}


}

export default ViewBox;