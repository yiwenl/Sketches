// ViewCursor.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/cursor.vert';
import fs from '../shaders/cursor.frag';

class ViewCursor extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this._scale = 0.001;
		this._isButtonPressed = false;

		this._offset = new alfrid.EaseNumber(0, 0.15);
	}


	_init() {
		this.mesh = Assets.get('pyramid');
		this.meshFrame = Assets.get('frame');
		this.meshPointer = Assets.get('pointer');
	}


	render(mPos, mQuat, mIsButtonPressed = false) {
		if(this._isButtonPressed !== mIsButtonPressed) {
			this._offset.value = mIsButtonPressed ? 1 : 0;
			this._isButtonPressed = mIsButtonPressed;
		}


		const color = mIsButtonPressed ? [1, 0.573, 0.596] : [1, 1, 1];

		this.shader.bind();
		this.shader.uniform("uScale", "float", this._scale);
		this.shader.uniform("uPosition", "vec3", mPos);
		this.shader.uniform("uQuat", "vec4", mQuat);
		this.shader.uniform("uOffset", "float", 0.0);
		this.shader.uniform("uOpacity", "float", 1.0);
		GL.draw(this.mesh);

		this.shader.uniform("uOffset", "float", this._offset.value);
		this.shader.uniform("uOpacity", "float", 1.0);
		GL.draw(this.meshFrame);

		if(mIsButtonPressed) {
			this.shader.uniform("uOffset", "float", 1.0);
			this.shader.uniform("uOpacity", "float", this._offset.value);
			GL.draw(this.meshPointer);	
		}
	}


}

export default ViewCursor;