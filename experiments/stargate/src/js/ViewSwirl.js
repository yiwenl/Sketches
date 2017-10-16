// ViewSwirl.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewSwirl extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		this.mesh = Assets.get('swirl');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewSwirl;