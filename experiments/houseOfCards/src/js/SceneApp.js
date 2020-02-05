// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import ViewCards from './ViewCards'
import { resize } from './utils'

import vs from 'shaders/floor.vert'
import fs from 'shaders/cards.frag'

class SceneApp extends Scene {
  constructor () {
    super()
    GL.enableAlphaBlending()
    this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3
    this.orbitalControl.radius.value = 8

    const { vec3, mat4 } = window
    this.lightPos = vec3.fromValues(0, 10, 5)
    this._cameraLight = new alfrid.CameraOrtho()
    const s = 5.5
    this._cameraLight.ortho(-s, s, s, -s, 5, 30)
    this._cameraLight.lookAt(this.lightPos, [0, 0, 0])

    this._biasMatrix = mat4.fromValues(
      0.5, 0.0, 0.0, 0.0,
      0.0, 0.5, 0.0, 0.0,
      0.0, 0.0, 0.5, 0.0,
      0.5, 0.5, 0.5, 1.0
    )
    this._shadowMatrix = mat4.create()
    mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix)
    mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix)

    this.mtxFloor = mat4.create()
    mat4.translate(this.mtxFloor, this.mtxFloor, vec3.fromValues(0, -3.5, 0))

    this.resize()
  }

  _initTextures () {
    console.log('init textures')

    const shadowMapSize = 1024
    this._fboShadow = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize)
  }

  _initViews () {
    console.log('init views')

    this._bCopy = new alfrid.BatchCopy()
    this._bAxis = new alfrid.BatchAxis()
    this._bDots = new alfrid.BatchDotsPlane()
    this._bBall = new alfrid.BatchBall()

    this._vCards = new ViewCards()

    this._drawFloor = new alfrid.Draw()
      .setMesh(alfrid.Geom.plane(20, 20, 1, 'xz'))
      .useProgram(vs, fs)
  }

  _updateShadowMap () {
    this._fboShadow.bind()
    GL.clear(1, 0, 0, 1)
    GL.setMatrices(this._cameraLight)
    this._vCards.renderShadow()

    this._fboShadow.unbind()
  }

  render () {
    GL.clear(0, 0, 0, 0)

    this._updateShadowMap()
    GL.setMatrices(this.camera)

    this._bAxis.draw()
    this._bDots.draw()

    this._vCards.render(this.lightPos, this._shadowMatrix, this._fboShadow.getDepthTexture())

    GL.rotate(this.mtxFloor)
    this._drawFloor
      .uniform('uLightPos', 'vec3', this.lightPos)
      .uniform('uShadowMatrix', 'mat4', this._shadowMatrix)
      .uniformTexture('textureDepth', this._fboShadow.depthTexture, 0)
      .draw()

    const s = 300
    GL.viewport(0, 0, s, s)
    this._bCopy.draw(this._fboShadow.depthTexture)
  }

  resize (w, h) {
    resize(w, h)
    this.camera.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
