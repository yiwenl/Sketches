// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import SubsceneBackground from './SubsceneBackground';
import ViewGiant from './ViewGiant';
import ViewMountains from './ViewMountains';
import ViewFilmGrain from './ViewFilmGrain';
import HeightMaps from './HeightMaps';
import Assets from './Assets';
import Params from './Params';

const RAD = Math.PI / 180;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		//	camera setup
		this.camera.setPerspective(65 * RAD, GL.aspectRatio, .1, 120);
		this.orbitalControl.rx.value = 0.3;
		this.orbitalControl.rx.limit(0.1, 1.0);
		this.orbitalControl.center[1] = 1.5;

		//	projection camera
		const s = 2.0;
		this._mtx = mat4.create();
		this.cameraVid = new alfrid.CameraOrtho();
		this.cameraVid.ortho(-s, s, s, -s, .1, 50);

		this._modelMatrix = mat4.create();
		mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, -2, 0));

		this._fogOffset = new alfrid.TweenNumber(0, 'linear');
	}

	_initTextures() {
		console.log('init textures');
		this._heightMaps = new HeightMaps();
	}


	_initViews() {
		console.log('init views');
		this._subBackground = new SubsceneBackground();
		this._vGiant = new ViewGiant();
		this._vMountains   = new ViewMountains();
		this._vFilmGrain = new ViewFilmGrain();
	}


	render() {
		this._subBackground.update();
		//	fog
		vec3.lerp(Params.shaderFogColor, Params.prevFogColor, Params.fogColor, this._fogOffset.value);
		if(this._fogOffset.value === 1) { Params.prevFogColor = Params.fogColor; }
		Params.shaderFogColor = Params.shaderFogColor.map((c)=>{ return c/255; });

		//	project texture
		const position = vec3.clone(this.camera.position);
		const mtx = mat4.create();
		mat4.rotateY(mtx, mtx, this.orbitalControl.ry.value);
		vec3.transformMat4(position, position, mtx);
		this.cameraVid.lookAt(position, vec3.fromValues(0, 1, 0), vec3.fromValues(0, 1, 0));
		mat4.multiply(this._mtx, this.cameraVid.projection, this.cameraVid.viewMatrix);

		
		GL.clear(0, 0, 0, 0);
		GL.rotate(this._modelMatrix);
		this._subBackground.render();

		this._vMountains.render(this._heightMaps.getTexture(), this._heightMaps.getNormalTexture(), Assets.get('studio_radiance'), Assets.get('irr'));
		this._vGiant.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aoGiant'), this._mtx);


		// GL.disable(GL.DEPTH_TEST);
		// this._vFilmGrain.render();
		// GL.enable(GL.DEPTH_TEST);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;