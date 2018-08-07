// ViewRoom.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import fs from 'shaders/room.frag';

class ViewRoom extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		this.mesh = Assets.get('room');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		Assets.get('aoRoom').bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewRoom;