// SceneApp.js

import alfrid, { Scene, GL, GLTFLoader } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 10;
	}

	_initTextures() {
		this.textureBrdf = Assets.get('brdfLUT');
		this.env = 'studio11';
		
		const envs = ['pisa', 'vatican'];
		for(let i=1; i<=12; i++) {
			envs.push(`studio${i}`);
		}

		this._updateEnvMap();

		gui.add(this, 'env', envs).onFinishChange(()=>this._updateEnvMap());

	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		const url = 'assets/gltf/FlightHelmet.gltf';
		GLTFLoader.load(url)
		.then((gltfInfo)=> {
			this.gltf = gltfInfo;
			const { meshes } = gltfInfo.output;
			this.scenes = gltfInfo.output.scenes;

			meshes.forEach( mesh => {
				mesh.material.uniforms.uBRDFMap = this.textureBrdf;
				mesh.material.uniforms.uIrradianceMap = this.textureIrr;
				mesh.material.uniforms.uRadianceMap = this.textureRad;
			});

		})
		.catch(e => {
			console.log('Error loading gltf:', e);
		});
	}


	_updateEnvMap() {
		this.textureIrr = Assets.get(`${this.env}_irradiance`);
		this.textureRad = Assets.get(`${this.env}_radiance`);

		if(this.gltf) {
			const { meshes } = this.gltf.output;

			meshes.forEach( mesh => {
				mesh.material.uniforms.uBRDFMap = this.textureBrdf;
				mesh.material.uniforms.uIrradianceMap = this.textureIrr;
				mesh.material.uniforms.uRadianceMap = this.textureRad;
			});
		}
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._bSky.draw(this.textureRad);

		if(this.scenes) {
			this.scenes.forEach( scene => {
				GL.draw(scene);
			});	
		}
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;