// SceneApp.js

import alfrid, { Scene, GL, Ray } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewWolf from './ViewWolf';
// import ViewGrass from './ViewGrass';
import ViewHitPlane from './ViewHitPlane';
import ViewNoise from './ViewNoise';
import ViewFloor from './ViewFloor';
import ViewBackground from './ViewBackground';
import ViewGrass2 from './ViewGrass2';

let gl;

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.camera.setPerspective(Math.PI * .5, GL.aspectRatio, .1, 100);
		gl = GL.gl;

		this.orbitalControl.radius.value = 12;
		this.orbitalControl.rx.value = 0.3;
		this.orbitalControl.rx.limit(0.2, 0.4);
		this.orbitalControl.ry.value = Math.PI;
		// this.orbitalControl.lockZoom(true);

		const yOffset = 0;
		this.orbitalControl.center[1] = yOffset + 1;
		this.orbitalControl.positionOffset[1] = yOffset;

		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this.hit = [999, 999, 999];

		this.pixels = new Float32Array(4);
		this.cnt = 0;

		GL.canvas.addEventListener('mousemove', (e)=>this._onMove(e));
		this.resize();
	}

	_initTextures() {
		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'));
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'));
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'));
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'));
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'));
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'));

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);
		this._textureRad = alfrid.GLCubeTexture.parseDDS(getAsset('radiance'));

		const noiseSize 	= 128;
		this._fboNoise 		= new alfrid.FrameBuffer(noiseSize, noiseSize);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();
		// this._vModel = new ViewObjModel();

		this._vWolf     = new ViewWolf();
		// this._vGrass    = new ViewGrass();
		this._vHitPlane = new ViewHitPlane();
		this._vNoise    = new ViewNoise();
		this._vFloor	= new ViewFloor();
		this._vBg 		= new ViewBackground();

		this._vGrass2 	= new ViewGrass2();
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
		const mesh = this._vHitPlane.mesh;
		const faceVertices = mesh.faces.map((face)=>(face.vertices));
		const offset = -1;
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


	render() {
		params.zOffset -= .1;
		// this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render();
		// if(this.cnt ++ %2 == 0) {
		// 	gl.readPixels(this._fboNoise.width/2, this._fboNoise.height/2+5, 1, 1, gl.RGBA, gl.FLOAT, this.pixels);	
		// }
		this._fboNoise.unbind();

		this._vBg.render();

		GL.disable(GL.CULL_FACE);
		this._vGrass2.render(this._fboNoise.getTexture(), this.hit, this._textureRad, this._textureIrr);
		GL.enable(GL.CULL_FACE);
		// this._vGrass.render(this._fboNoise.getTexture(), this.hit, this._textureRad, this._textureIrr);
		this._vFloor.render(this._fboNoise.getTexture());
		this._vWolf.render(this._textureRad, this._textureIrr, 0.0);

/*
		const posOffsets = this._vGrass.positionOffsets;
		const distances = this._vGrass.distances;
		const s = 1;
		const thresholdHigh = 25.0;
		let colour, distance;
		posOffsets.map( (pos, i) => {
			distance = distances[i];
			if(distance > params.lodThresholdLow) {
				colour = [.5, .25, .2];
			} else if(distance > params.lodThresholdHigh) {
				colour = [1, .6, .5];
			} else {
				colour = [1, .9, .8];
			}
		});
*/

		const size = 100;

		// GL.viewport(0, 0, size, size);
		// this._bCopy.draw(this._fboNoise.getTexture());
	}


	resize() {
		let h = Math.min(window.innerWidth*0.4, window.innerHeight);
		// h = window.innerHeight;
		GL.setSize(window.innerWidth, h);
		this.yOffset = (window.innerHeight - h)/2;

		GL.canvas.style.height = `${h}px`;
		GL.canvas.style.top = `${this.yOffset}px`;
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;