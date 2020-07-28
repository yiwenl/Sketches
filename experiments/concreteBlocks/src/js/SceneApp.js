// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import ViewObjModel from './ViewObjModel'
import Assets from './Assets'
import Config from './Config'
import { resize } from './utils'
import DebugCamera from 'debug-camera'

class SceneApp extends Scene {
  constructor () {
    super()
    GL.enableAlphaBlending()
    // this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3
    this.orbitalControl.radius.value = 3

    this._lightPos = [0, 4, 1.5]
    // this._cameraLight = new alfrid.CameraPerspective()
    // this._cameraLight.setPerspective(Math.PI * 0.25, 1, 3, 6.5)
    const s = 1.2
    this._cameraLight = new alfrid.CameraOrtho()
    this._cameraLight.ortho(-s, s, s, -s, 3.0, 5.5)
    this._cameraLight.lookAt(this._lightPos, [0, 0, 0])

    this._biasMatrix = mat4.fromValues(
      0.5, 0.0, 0.0, 0.0,
      0.0, 0.5, 0.0, 0.0,
      0.0, 0.0, 0.5, 0.0,
      0.5, 0.5, 0.5, 1.0
    )

    this._shadowMatrix = mat4.create()
    mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix)
    mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix)

    this.resize()
  }

  _initTextures () {
    console.log('init textures')

    const fboSize = 1024
    this._fboShadow = new alfrid.FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR
    })
  }

  _initViews () {
    console.log('init views')

    this._bCopy = new alfrid.BatchCopy()
    this._bAxis = new alfrid.BatchAxis()
    this._bDots = new alfrid.BatchDotsPlane()
    this._bBall = new alfrid.BatchBall()

    this._vModel = new ViewObjModel()
    window.GL = GL
  }

  update () {
    this._fboShadow.bind()
    GL.clear(0, 0, 0, 0)
    GL.setMatrices(this._cameraLight)
    this._renderBlocks(false)
    this._fboShadow.unbind()
  }

  _renderBlocks (withShadow = true) {
    this._vModel.render(
      Assets.get(`${Config.env}_radiance`),
      Assets.get(`${Config.env}_irradiance`),
      this._shadowMatrix,
      withShadow ? this._fboShadow.getDepthTexture() : alfrid.GLTexture.greyTexture()
    )
  }

  render () {
    const g = 1
    GL.clear(g, g, g, 1)

    GL.setMatrices(this.camera)
    // this._bAxis.draw()
    // this._bDots.draw()

    this._renderBlocks()

    let s = 0.1
    this._bBall.draw(this._lightPos, [s, s, s], [1, 0, 0])

    DebugCamera(this._cameraLight)

    s = 300
    GL.viewport(0, 0, s, s)
    // this._bCopy.draw(this._fboShadow.getDepthTexture())
  }

  resize (w, h) {
    resize(w, h)
    this.camera.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
