// ViewAR.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/ar.vert';
import fs from 'shaders/ar.frag';
import fsOes from 'shaders/arOES.frag';

const combineOrientations = (screenOrientation, seeThroughCameraOrientation) => {
  let seeThroughCameraOrientationIndex = 0;
  switch (seeThroughCameraOrientation) {
    case 90:
      seeThroughCameraOrientationIndex = 1;
      break;
    case 180:
      seeThroughCameraOrientationIndex = 2;
      break;
    case 270:
      seeThroughCameraOrientationIndex = 3;
      break;
    default:
      seeThroughCameraOrientationIndex = 0;
      break;
  }
  let screenOrientationIndex = 0;
  switch (screenOrientation) {
    case 90:
      screenOrientationIndex = 1;
      break;
    case 180:
      screenOrientationIndex = 2;
      break;
    case 270:
      screenOrientationIndex = 3;
      break;
    default:
      screenOrientationIndex = 0;
      break;
  }
  let ret = screenOrientationIndex - seeThroughCameraOrientationIndex;
  if (ret < 0) {
    ret += 4;
  }
  return ret % 4;
}

class ViewAR extends alfrid.View {
	
	constructor() {
		super(vs, fsOes);
	}


	_init() {
		this.passThroughCamera = ARDisplay.getPassThroughCamera();
		this.mesh = new alfrid.Mesh();

		const positions = [
			[-1.0, 1.0, 0.0],
			[-1.0, -1.0, 0.0],
			[1.0, 1.0, 0.0],
			[1.0, -1.0, 0.0],
		]

		this.mesh.bufferVertex(positions);

		let u = window.WebARonARKitSendsCameraFrames ? 1.0 :
		  this.passThroughCamera.width / this.passThroughCamera.textureWidth;
		let v = window.WebARonARKitSendsCameraFrames ? 1.0 :
		  this.passThroughCamera.height / this.passThroughCamera.textureHeight;
		let textureCoords = [
		  [[0.0, 0.0], [0.0, v], [u, 0.0], [u, v]],
		  [[u, 0.0], [0.0, 0.0], [u, v], [0.0, v]],
		  [[u, v], [u, 0.0], [0.0, v], [0.0, 0.0]],
		  [[0.0, v], [u, v], [0.0, 0.0], [u, 0.0]],
		];

		this.combinedOrientation = combineOrientations(
			screen.orientation ? screen.orientation.angle : window.orientation,
			this.passThroughCamera.orientation
		);

		this.textureCoords = textureCoords;
		let uv = textureCoords[this.combinedOrientation];
		this.mesh.bufferTexCoord(uv);
		this.mesh.bufferIndex([0, 1, 2, 2, 1, 3]);


		this.textureTarget = GL.gl.TEXTURE_EXTERNAL_OES;

		this.texture = new alfrid.GLTexture();
		console.log('this.textureTarget', this.textureTarget);
	}


	render() {

		if (this.passThroughCamera.textureWidth === 0 ||
		    this.passThroughCamera.textureHeight === 0) {
		  return;
		}

		let combinedOrientation = combineOrientations(
			screen.orientation ? screen.orientation.angle : window.orientation,
			this.passThroughCamera.orientation
		);

		if(combinedOrientation !== this.combinedOrientation) {
			this.combinedOrientation = combinedOrientation;
			let uv = this.textureCoords[this.combinedOrientation];
			this.mesh.bufferTexCoord(uv);
		}

		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewAR;