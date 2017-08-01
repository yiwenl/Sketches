// ViewTree.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewTree extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		this.mesh = Assets.get('tree');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewTree;