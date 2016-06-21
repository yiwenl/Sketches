// SceneApp.js

import alfrid, { Scene, Ray, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewLines from './ViewLines';
import ViewSphere from './ViewSphere';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.radius.limit(7, 10);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.hit = [999, 999, 999];

		window.addEventListener('mousemove', (e)=>this._onMove(e));
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};

		this._fbos = [];
		for(let i=0; i<params.numFbos; i++) {
			const fbo = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
			this._fbos.push(fbo);
		}

		this._textureGradient = new alfrid.GLTexture(getAsset('gradient'));

		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'));
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'));
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'));
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'));
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'));
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'));

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);
		this._textureRad = alfrid.GLCubeTexture.parseDDS(getAsset('radiance'));
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vRender = new ViewRender();
		this._vSim    = new ViewSim();
		this._vLines  = new ViewLines();
		this._vSphere = new ViewSphere();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		const fbo = this._fbos[this._fbos.length-1];
		fbo.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		fbo.unbind();		

		GL.setMatrices(this.camera);
	}


	_onMove(e) {
		let mx, my;
		if(e.touches) {
			mx = (e.touches[0].pageX / GL.width) * 2.0 - 1.0;
			my = - (e.touches[0].pageY / GL.height) * 2.0 + 1.0;
		} else {
			mx = (e.clientX / GL.width) * 2.0 - 1.0;
			my = - (e.clientY / GL.height) * 2.0 + 1.0;	
		}
		
		this.camera.generateRay([mx, my, 0], this._ray);
		const mesh = this._vSphere.mesh;
		const faceVertices = mesh.faces.map((face)=>(face.vertices));
		const offset = 0;
		let v0, v1, v2;
		let hit = [999, 999, 999];

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		this.hit = hit || [999, 999, 999];
	}

	updateFbo() {
		const fboTarget = this._fbos.shift();
		const fboCurrent = this._fbos[this._fbos.length-1];

		fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSim.render(fboCurrent.getTexture(1), fboCurrent.getTexture(0), fboCurrent.getTexture(2), this.hit);
		fboTarget.unbind();

		this._fbos.push(fboTarget);
	}


	render() {
		this.updateFbo();

		GL.clear(0, 0, 0, 0);
		const fboTarget = this._fbos[this._fbos.length-1];
		if(params.mode === 'dots') {
			this._vRender.render(fboTarget.getTexture(0), fboTarget.getTexture(2), fboTarget.getTexture(3), this._textureGradient);
		} else {
			this._vLines.render(this._fbos, this._textureGradient);	
		}

		this._vSphere.render(this._textureRad, this._textureIrr);
		
		if(params.debug) {
			const size = Math.min(params.numParticles, GL.height/4);

			for(let i=0; i<4; i++) {
				GL.viewport(0, size * i, size, size);
				this._bCopy.draw(this._fbos[0].getTexture(i));
			}	
		}
		

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;