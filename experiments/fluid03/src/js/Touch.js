
import alfrid, { GL, TouchDetector, EventDispatcher } from 'alfrid';
import Config from './Config';

const getTextureSpacePos = (value) => {
	let p = value / Config.PLANE_SIZE * 2;
	p = p * 0.5 + 0.5;

	return Config.TEXTURE_SIZE * p;
}

class Touch extends EventDispatcher {
	constructor(mCamera) {
		super();
		const size = Config.PLANE_SIZE;
		const mesh = alfrid.Geom.plane(size, size, 1, 'xz');

		this._detector = new TouchDetector(mesh, mCamera);

		this._detector.on('onHit', (e)=> this._onMove(e));
		this._detector.on('onUp', (e)=> this._onUp(e));

		this._position = vec3.create();
		this._prePos = vec3.create();

		this._isHit = false;
	}


	_onUp(e) {
		this._isHit = false;
	}


	_onMove(e) {
		if(!this._isHit) {
			vec3.copy(this._prePos, e.detail.hit);
			vec3.copy(this._position, e.detail.hit);
		} else {
			vec3.copy(this._prePos, this._position);
			vec3.copy(this._position, e.detail.hit);	
		}

		this._isHit = true;
		


		const scale = 40;
		let x = getTextureSpacePos(this._position[0]);
		let z = getTextureSpacePos(this._position[2]);
		let dx = (x - getTextureSpacePos(this._prePos[0])) * scale;
		let dz = -(z - getTextureSpacePos(this._prePos[2])) * scale;

		this.trigger('onDrag', {
			x,
			y:z,
			dx,
			dy:dz,
			radius:0.0025
		});
	}
}

export default Touch;