import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  CameraOrtho,
  FrameBuffer,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import {
  random,
  biasMatrix,
  pick,
  toGlsl,
  saveImage,
  getDateString,
} from "./utils";
import Config from "./Config";

import { mat4 } from "gl-matrix";

import DrawChar from "./DrawChar";
import DrawFloor from "./DrawFloor";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();
    this.orbitalControl.rx.setTo(-0.8);
    this.orbitalControl.radius.setTo(10);

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _init() {
    this.resize();

    // get chars
    let chars = document.querySelector("#text").innerHTML.split("");
    let selected = [];
    chars.forEach((char) => {
      // console.log(char, char.charCodeAt(0));
      let charCode = char.charCodeAt(0);
      if (
        charCode > 12301 &&
        charCode < 65281 &&
        selected.indexOf(char) === -1
      ) {
        selected.push(char);
      }
    });

    this.selectedChars = selected;

    // light
    this._light = [-3, 7, -3];
    // vec3.rotateZ(this._light, this._light, [0, 0, 0], -0.5);
    // vec3.rotateX(this._light, this._light, [0, 0, 0], -0.2);
    this._cameraLight = new CameraOrtho();
    let r = 4;
    this._cameraLight.ortho(-r, r, r, -r, 5, 25);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);

    // shadow matrix
    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
    this._hasShadowMap = false;
  }

  _initTextures() {
    const fboSize = 2048 * 2;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawChar = new DrawChar(pick(this.selectedChars), 0.5, 0.1);
    this._drawFloor = new DrawFloor();

    const num = 3;
    this._chars = [];
    for (let x = -num; x <= num; x++) {
      for (let z = -num; z <= num; z++) {
        const drawChar = new DrawChar(
          pick(this.selectedChars),
          0.5,
          random(0.1, 0.2)
        );
        drawChar.x = x * 0.5;
        drawChar.z = z * 0.5;
        this._chars.push(drawChar);
      }
    }

    // this._chars = [this._drawChar];
  }

  update() {
    if (!this._hasShadowMap) {
      this._fboShadow.bind();
      GL.clear(1, 1, 1, 1);
      GL.setMatrices(this._cameraLight);
      this._renderChars(false);
      this._fboShadow.unbind();

      this._hasShadowMap = true;
    }
  }

  _renderChars(mShadow) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._chars[0].texture;

    this._chars.forEach((drawChar) => {
      drawChar
        .bindTexture("uDepthMap", tDepth, 1)
        .uniform("uShadowMatrix", "mat4", this.mtxShadow)
        .draw();
    });
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dCamera.draw(this._cameraLight, [1, 0.5, 0]);
    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", "mat4", this.mtxShadow)
      .draw();
    this._renderChars(true);

    g = 200;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._drawChar.texture);
    GL.viewport(g, 0, g, g);
    this._dCopy.draw(this._fboShadow.depthTexture);

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
  }
}

export default SceneApp;
