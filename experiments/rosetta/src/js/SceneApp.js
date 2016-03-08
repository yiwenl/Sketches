// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSimulation from './ViewSimulation';
import ViewPlanes from './ViewPlanes';
import ViewShip from './ViewShip';
import ViewBall from './ViewBall';
import ViewSkybox from './ViewSkybox';

let GL;

const BALLS = [
	{
		position:[0, 0, 0],
		scale:2.0
	},
	{
		position:[0, 2.95, 1],
		scale:1.1
	},
	{
		position:[1.5, -0.1, 0],
		scale:1.35
	},
	{
		position:[3, -0.1, 0],
		scale:1.35
	},
	{
		position:[4.5, -0.1, 0],
		scale:1.35
	},
	{
		position:[6, -0.1, 0],
		scale:1.35
	},
	{
		position:[7.5, -0.1, 0],
		scale:1.35
	},
	{
		position:[-1.5, -0.1, 0],
		scale:1.35
	},
	{
		position:[-3, -0.1, 0],
		scale:1.35
	},
	{
		position:[-4.5, -0.1, 0],
		scale:1.35
	},
	{
		position:[-6, -0.1, 0],
		scale:1.35
	},
	{
		position:[-7.5, -0.1, 0],
		scale:1.35
	}

];

class SceneApp extends alfrid.Scene {
	constructor() {
		GL = alfrid.GL;
		GL.enableAlphaBlending();
		super();

		this.camera.setPerspective(Math.PI * .35, GL.aspectRatio, 1, 200);
		this.orbitalControl._rx.value = .3;
		this.orbitalControl.radius.value = 25.0;
		this.orbitalControl.radius.limit(20, 30);
		this._count = 0;
		this._flip = 0;
	}


	_initTextures() {
		console.log('Init textures');

		function getAsset(id) {
			for(var i=0; i<assets.length; i++) {
				if(id === assets[i].id) {
					return assets[i].file;
				}
			}
		}

		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'))
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'))
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'))
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'))
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'))
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'))

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);

		let rad_posx = alfrid.HDRLoader.parse(getAsset('rad_posx'))
		let rad_negx = alfrid.HDRLoader.parse(getAsset('rad_negx'))
		let rad_posy = alfrid.HDRLoader.parse(getAsset('rad_posy'))
		let rad_negy = alfrid.HDRLoader.parse(getAsset('rad_negy'))
		let rad_posz = alfrid.HDRLoader.parse(getAsset('rad_posz'))
		let rad_negz = alfrid.HDRLoader.parse(getAsset('rad_negz'))

		this._textureRad = new alfrid.GLCubeTexture([rad_posx, rad_negx, rad_posy, rad_negy, rad_posz, rad_negz]);


		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}
		this._fboCurrent = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);
		this._fboTarget  = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);

		let shadowMapSize = 1024;
		this._fboShadowMap = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize);


		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));
	}
	

	_initViews() {
		console.log('Init Views');
		this._vRender	 = new ViewRender();
		this._vPlanes 	 = new ViewPlanes();
		this._vSim		 = new ViewSimulation(BALLS);
		this._vShip 	 = new ViewShip();
		this._vBall 	 = new ViewBall();
		this._vSkybox 	 = new ViewSkybox();

		//	SAVE INIT POSITIONS
		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();

		this._fboCurrent.unbind();
		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);
	}


	updateFbo() {
		GL.setMatrices(this.cameraOrtho);

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSim.render(this._fboCurrent.getTexture());
		this._fboTarget.unbind();
		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);

		//	PING PONG
		var tmp = this._fboTarget;
		this._fboTarget = this._fboCurrent;
		this._fboCurrent = tmp;
	}


	render() {
		//	CAMERA MOVEMENT
		// this.orbitalControl._ry.value += .01;


		//	PBR STUFF

		params.roughness = params.offset;
		params.metallic = 1.0 - params.roughness;
		params.specular = (1.0 - params.roughness) * .9 + .1;
		params.specular *= .5;
		

		//	UPDATE PARTICLES POSITION

		let p = 0;

		if(this._count % params.skipCount === 0) {
			this._count = 0;
			this.updateFbo();
		}
		p = this._count / params.skipCount;
		this._count ++;
		this._flip = this._flip == 0 ? 1 : 0;


		//	RENDERS

		// GL.setMatrices(this.cameraSkybox);
		this._vSkybox.render(this._textureRad);

		GL.setMatrices(this.camera);
		this._vPlanes.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p, this._flip);
		this._vShip.render(this._textureRad, this._textureIrr, this._textureAO, this._fboTarget.getTexture());

		/*/
		for(let i=0; i<BALLS.length; i++) {
			let b = BALLS[i];
			this._vBall.render(b.position, [b.scale, b.scale, b.scale], [1, 0, 0]);
		}
		//*/
	}
}


export default SceneApp;