// Wave.js
import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewSim from './ViewSim';

const NUM_SETS = 10; 
var random = function(min, max) { return min + Math.random() * (max - min);	}

class Wave {
	constructor(mScene) {

		this.camera = mScene.camera;
		this.cameraOrtho = mScene.cameraOrtho;
		this._count = Math.floor(Math.random() * params.skipCount);

		this._initFBO();
		this._isResetting = false;

		//	views
		this._vSim 	  = new ViewSim();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);


		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboCurrent.unbind();

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboTarget.unbind();

		GL.setMatrices(this.camera);

		this._matrices = [];
		const {PI} = Math;
		for(let i = 0; i<NUM_SETS; i++) {
			const m = mat4.create();
			const ry = random(-PI, PI);
			const rx = random(-.1, .1);
			const rz = random(-.1, .1);
			mat4.rotateY(m, m, ry);
			mat4.rotateX(m, m, rx);
			mat4.rotateZ(m, m, rz);
			this._matrices.push(m);
		}
	}


	_initFBO() {
		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
	}


	reset(o) {
		this._vSim.reset(o.percent);
		this._count = 0;
	}


	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(2),
			this._fboCurrent.getTexture(3)
			);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;
	}


	update() {
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}
	}


	render(view, shadowMatrix, textureDepth) {
		let p = this._count / params.skipCount;

		this._matrices.forEach( m => {
			GL.rotate( m );
			view.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), shadowMatrix, textureDepth);
		});
	}


	renderShadow(view, shadowMatrix) {
		let p = this._count / params.skipCount;

		this._matrices.forEach( m => {
			GL.rotate( m );
			view.renderShadow(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2), shadowMatrix);
		});
	}
}


export default Wave;