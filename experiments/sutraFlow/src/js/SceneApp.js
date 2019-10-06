// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import FluidSimulation from './FluidSimulation'
import Config from './Config'
import Assets from './Assets'
import FlipBoard from './FlipBoard.js'
import DrawSquare from './DrawSquare.js'
import { resize } from './utils'

const NUM_STEP = 5

class SceneApp extends Scene {
  constructor () {
    super()
    this.camera.setPerspective(Math.PI / 4, GL.aspectRatio, 1, 50)
    GL.enableAlphaBlending()
    const r = 1.2
    this.orbitalControl.ry.limit(-r, r)
    this.orbitalControl.radius.value = 7
    this.orbitalControl.radius.limit(3, 15)

    this.cameraFront = new alfrid.CameraPerspective()
    this.cameraFront.setPerspective(45 * Math.PI / 180, GL.aspectRatio, 0.1, 100)
    this.cameraFront.lookAt([0, 0, 5], [0, 0, 0])

    this._count = 0
    this.resize()
  }

  _initTextures () {
    const size = Config.TEXTURE_SIZE
    this._fbo = new alfrid.FboPingPong(size, size)
  }

  testOpen () {
    this._board.open(this._isWen ? Assets.get('liquid') : Assets.get('wen'))
    this._isWen = !this._isWen
  }

  _initViews () {
    this._bAxis = new alfrid.BatchAxis()
    this._bCopy = new alfrid.BatchCopy()
    this._fluid = new FluidSimulation(this.camera)

    this._board = new FlipBoard()
    this._drawSquare = new DrawSquare()

    const s = Config.PLANE_SIZE
    this._draw = new alfrid.Draw()
      .setMesh(alfrid.Geom.plane(s, s, 1))
      .useProgram(alfrid.ShaderLibs.basicVert, alfrid.ShaderLibs.copyFrag)
  }

  update () {
    // update fluid
    this._fluid.update()

    if (this._count++ >= NUM_STEP) {
      this._fbo.read.bind()
      GL.clear(0, 0, 0, 0)
      this._bCopy.draw(this._fluid.density)
      this._fbo.read.unbind()

      this._board.open(this._fbo.read.texture)

      this._fbo.swap()
      this._count = 0
    }
  }

  render () {
    const g = 0.0
    GL.clear(g, g, g, 1)
    GL.viewport(0, 0, GL.width, GL.height)
    GL.setMatrices(this.camera)

    this._draw
      .uniformTexture('texture', this._fluid.density, 0)
      // .draw()

    GL.disable(GL.DEPTH_TEST)
    this._drawSquare
      .uniformTexture('textureCurr', this._fbo.read.texture, 1)
      .uniformTexture('texturePrev', this._fbo.write.texture, 2)
      .uniform('uPercent', 'float', this._count / NUM_STEP)
      .draw()
    GL.enable(GL.DEPTH_TEST)
  }

  resize (w, h) {
    resize(w, h)
    this.camera.setAspectRatio(GL.aspectRatio)
    this.cameraFront.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
