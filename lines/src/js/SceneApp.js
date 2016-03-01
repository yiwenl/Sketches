// SceneApp.js
import alfrid 			from './libs/alfrid.js';
import ViewHead 		from './ViewHead';
import ViewPost 		from './ViewPost';

var glslify = require("glslify");

let GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		let fov = 60;
		this.camera.setPerspective(fov*Math.PI/180, GL.aspectRatio, 1, 100);
		this.orbitalControl.radius.value = 4;
		this.orbitalControl.lockZoom();
		this._lightPosition = [5, 10, 5];
	}


	_initTextures() {
		function getAsset(id) {
			for(var i=0; i<assets.length; i++) {
				if(id === assets[i].id) {
					return assets[i].file;
				}
			}
		}


		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));
		this._textureLight = new alfrid.GLTexture(getAsset('light'));

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboNormal = new alfrid.FrameBuffer(GL.width, GL.height);
	}
	

	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._vHead = new ViewHead();
		this._vPost = new ViewPost();
	}

	render() {
		// this.orbitalControl._ry.value += .01;
		if(!this._vHead.isReady) {
			return;
		}

		if(document.body.classList.contains('isLoading')) {
			document.body.classList.remove('isLoading');
		}
		

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vHead.render(this._textureAO, this._lightPosition);
		this._fboRender.unbind();

		this._fboNormal.bind();
		GL.clear(0.5, 0.5, 0, 1);
		this._vHead.render(this._textureAO, this._lightPosition, true);
		this._fboNormal.unbind();

		// this._bCopy.draw(this._fboNormal.getTexture());
		this._vPost.render(this._fboRender.getTexture(), this._fboNormal.getTexture(), this._textureLight)

	}
}


export default SceneApp;