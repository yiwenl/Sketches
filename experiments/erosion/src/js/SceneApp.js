// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import Assets from './Assets'
import Config from './Config'
import { resize } from './utils'
import DebugCamera from 'debug-camera'

import DrawTerrain from './DrawTerrain'
import NoiseTexture from './NoiseTexture'
import ErosionSimulation from './ErosionSimulation'

class SceneApp extends Scene {
  constructor () {
    super()
    GL.enableAlphaBlending()
    this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3
    this.orbitalControl.radius.value = 5

    this.cameraTop = new alfrid.CameraOrtho()
    const s = Config.planeSize / 2

    const { mat4 } = window
    this.cameraTop.ortho(-s, s, s, -s, 1, 3)
    this.cameraTop.lookAt([0, 3, 0], [0, 0, 0], [0, 0, -1])
    this.mtxIdentity = mat4.create()
    this.mtxTop = mat4.create()
    mat4.mul(this.mtxTop, this.cameraTop.projection, this.cameraTop.matrix)

    // simulation
    this._simulation = new ErosionSimulation()
    this.reset()

    gui.add(this._simulation, 'start')
    gui.add(this._simulation, 'stop')
    gui.add(this._simulation, 'step').listen();

    window.addEventListener('keydown', e => {
      if (e.keyCode === 32) {
        this._simulation.toggle()
      }
    })

    this.resize()
  }

  reset () {
    this._simulation.reset(this._textureNoise)
  }

  _initTextures () {
    console.log('init textures')
    this._textureNoise = new NoiseTexture().texture
  }

  _initViews () {
    console.log('init views')

    this._bCopy = new alfrid.BatchCopy()
    this._bAxis = new alfrid.BatchAxis()
    this._bDots = new alfrid.BatchDotsPlane()
    this._bBall = new alfrid.BatchBall()

    this._drawTerrain = new DrawTerrain()
  }

  update () {
    this._simulation.update()
  }

  render () {
    GL.clear(0, 0, 0, 0)

    this._bAxis.draw()
    this._bDots.draw()

    this._drawTerrain
      .uniform('uTopMatrix', 'mat4', this.mtxTop)
      .uniformTexture('textureHeight', this._simulation.texture, 0)
      .draw()

    GL.rotate(this.mtxIdentity)
    DebugCamera(this.cameraTop)
    const s = 128
    GL.viewport(0, 0, s, s)
    this._bCopy.draw(this._textureNoise)
    GL.viewport(s, 0, s, s)
    this._bCopy.draw(this._simulation.texture)
    GL.viewport(s * 2, 0, s, s)
    this._bCopy.draw(this._simulation._fboFlux.read.texture)
  }

  resize (w, h) {
    resize(w, h)
    this.camera.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
