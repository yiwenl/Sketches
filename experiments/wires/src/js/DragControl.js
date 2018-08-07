// DragControl.js

import alfrid, { GL, EventDispatcher, TouchDetector } from 'alfrid';


let meshWall;
let shader;

class DragControl extends EventDispatcher {
	constructor(mMesh, mPosition, mCamera, mCameraControl) {
		super();
		console.log('mPosition', mPosition);

		this._control = mCameraControl;

		this.mtxBall = mat4.create();
		mat4.translate(this.mtxBall, this.mtxBall, mPosition);


		this.mtxWall = mat4.create();
		mat4.translate(this.mtxWall, this.mtxWall, vec3.fromValues(mPosition[0], 0, 0));

		const size = 10;
		if(!meshWall) { meshWall = new alfrid.Geom.cube(.01, size, size); }

		if(!shader) { shader = new alfrid.GLShader(); }

		this._isMouseDown = false;
		this._isOnBall = false;


		this._detectorBall = new TouchDetector(mMesh, mCamera);
		mat4.copy(this._detectorBall.mtxModel, this.mtxBall);

		this._detectorWall = new TouchDetector(meshWall, mCamera);
		mat4.copy(this._detectorWall.mtxModel, this.mtxWall);

		this._detectorWall.disconnect();
		this._detectorWall.on('onHit', (e)=> {
			mat4.identity(this.mtxBall);
			mat4.translate(this.mtxBall, this.mtxBall, e.detail.hit);
			this.trigger('onHit', e.detail.hit);
		});

		this._detectorBall.on('onHit', (e) => {
			if(this._isMouseDown) {
				this._detectorWall.connect();
				this._control.lock(true);	
			}
			
		});

		window.addEventListener('mouseup', ()=> {
			this._detectorWall.disconnect();
			mat4.copy(this._detectorBall.mtxModel, this.mtxBall);
			this._control.lock(false);
			this._control.lockZoom(true);
			this._isMouseDown = false;
		});

		window.addEventListener('mousedown', ()=> {
			this._isMouseDown = true;
		})
	}


	debug() {
		shader.bind();
		GL.rotate(this.mtxWall);
		GL.draw(meshWall);
	}

}

export default DragControl;