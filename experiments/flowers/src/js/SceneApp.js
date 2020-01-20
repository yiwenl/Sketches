// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import FluidSimulation from './FluidSimulation'
import Config from './Config'
import Assets from './Assets'
import { resize } from './utils'
import ViewSphere from './ViewSphere'

const NUM_STEP = 5

class SceneApp extends Scene {
  constructor () {
    super()

    this.camera.setPerspective(Math.PI / 4, GL.aspectRatio, 1, 50)
    GL.enableAlphaBlending()
    const r = Math.PI / 2
    const r1 = Math.PI / 5
    this.orbitalControl.ry.setTo(Math.PI / 2)
    this.orbitalControl.radius.value = 4
    this.orbitalControl.radius.limit(3, 7)
    this.orbitalControl.ry.limit(Math.PI / 2 - r, Math.PI / 2 + r)
    this.orbitalControl.rx.limit(-r1, r1)

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
    this._bBall = new alfrid.BatchBall()
    this._vSphere = new ViewSphere()
    this._fluid = new FluidSimulation(this.camera)

    const s = Config.PLANE_SIZE
    this._draw = new alfrid.Draw()
      .setMesh(alfrid.Geom.plane(s, s, 1))
      .useProgram(alfrid.ShaderLibs.basicVert, alfrid.ShaderLibs.copyFrag)

    this._drawSphere = new alfrid.Draw()
      .setMesh(alfrid.Geom.sphere(0.95, 24))
      // .useProgram(null, alfrid.ShaderLibs.copyFrag)
      .useProgram(null, alfrid.ShaderLibs.simpleColorFrag)
      .uniform('color', 'vec3', [0, 0, 0])
      .uniform('opacity', 'float', 0.5)
  }

  update () {
    // update fluid
    this._fluid.update()

    if (this._count++ >= NUM_STEP) {
      this._fbo.read.bind()
      GL.clear(0, 0, 0, 0)
      this._bCopy.draw(this._fluid.density)
      this._fbo.read.unbind()

      this._fbo.swap()
      this._count = 0
    }
  }

  render () {
    const g = 0.05
    GL.clear(g, g, g, 1)
    GL.viewport(0, 0, GL.width, GL.height)
    GL.setMatrices(this.camera)

    this._vSphere.render(this._fluid.density)
    this._drawSphere.uniformTexture('texture', this._fluid.density, 0).draw()
    // this._drawSphere.draw()
  }

  resize (w, h) {
    resize(w, h)
    this.camera.setAspectRatio(GL.aspectRatio)
    this.cameraFront.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
