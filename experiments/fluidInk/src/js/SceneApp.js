// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import FluidSimulation from './FluidSimulation'
import ViewPlane from './ViewPlane'
import ViewLines from './ViewLines'
import Assets from './Assets'
import PassNormal from './passes/PassNormal'
import PassBloom from './PassBloom'

class SceneApp extends Scene {
  constructor () {
    super()
    this.resize()
    this.camera.setPerspective(Math.PI / 4, GL.aspectRatio, 1, 50)
    GL.enableAlphaBlending()
    // this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.8;
    this.orbitalControl.rx.value = 0.8
    // this.orbitalControl.ry.value = Math.PI;
    this.orbitalControl.radius.value = 15
    this.orbitalControl.radius.limit(10, 25)
    this.orbitalControl.rx.limit(0.1, Math.PI / 2 - 0.1)

    // gui.add(params, 'height', 1, 5);
    // gui.add(params, 'cap', 0, 5);
  }

  _initTextures () {
    const s = 1024
    this._fboNormal = new alfrid.FrameBuffer(s, s, { minFilter: GL.LINEAR, magFilter: GL.LINEAR })

    const oRender = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type: GL.FLOAT
    }

    this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender)
  }

  _initViews () {
    this._bCopy = new alfrid.BatchCopy()
    this._fluid = new FluidSimulation(this.camera)

    this._vPlane = new ViewPlane()
    this._passNormal = new PassNormal()
    this._vLines = new ViewLines()
    this._passBloom = new PassBloom(3)
  }

  render () {
    this._fluid.update()

    this._fboNormal.bind()
    GL.clear(0, 0, 0, 0)
    this._passNormal.render(this._fluid.density)
    this._fboNormal.unbind()

    this._fboRender.bind()
    GL.clear(0, 0, 0, 0)

    if (((window.params.type + 1) & 2) > 0) {
      this._vLines.render(this._fluid.density, this._fboNormal.getTexture(), Assets.get('noise_radiance'), Assets.get('noise_irradiance'))
    }

    if (((window.params.type + 1) & 1) > 0) {
      this._vPlane.render(this._fluid.density, this._fboNormal.getTexture(), Assets.get('noise_org'), Assets.get('irr'))
    }

    this._fboRender.unbind()

    this._passBloom.render(this._fboRender.getTexture())

    GL.clear(0, 0, 0, 0)
    GL.disable(GL.DEPTH_TEST)
    GL.viewport(0, 0, GL.width, GL.height)
    GL.enableAdditiveBlending()
    this._bCopy.draw(this._fboRender.getTexture())
    this._bCopy.draw(this._passBloom.getTexture())

    GL.enableAlphaBlending()
    GL.enable(GL.DEPTH_TEST)
  }

  resize () {
    const { innerWidth, innerHeight } = window
    GL.setSize(innerWidth, innerHeight)
    this.camera.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
