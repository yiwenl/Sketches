// SceneApp.js

import alfrid, { GL, FboPingPong } from 'alfrid'
import ViewSave from './ViewSave'
import ViewRender from './ViewRender'
import ViewRenderShadow from './ViewRenderShadow'
import ViewSim from './ViewSim'
import ViewMask from './ViewMask'
import Config from './Config'
import ParticleTexture from './ParticleTexture'
import { resize, biasMatrix } from './utils'

window.getAsset = function (id) {
  return assets.find((a) => a.id === id).file
}

const LIGHT_POS = [0, 10, 2]

class SceneApp extends alfrid.Scene {
  constructor () {
    super()
    GL.enableAlphaBlending()

    this._count = 0
    this.camera.setPerspective(Math.PI / 2, GL.aspectRatio, 0.1, 50)
    this.orbitalControl.radius.value = 10
    this.orbitalControl.radius.limit(10, 10)

    this._cameraLight = new alfrid.CameraOrtho()
    const s = 6
    this._cameraLight.ortho(-s, s, s, -s, 1, 50)
    this._cameraLight.lookAt(LIGHT_POS, [0, 0, 0])
    this._shadowMatrix = mat4.create()
    mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix)
    mat4.multiply(this._shadowMatrix, biasMatrix, this._shadowMatrix)
  }

  _initTextures () {
    console.log('init textures')

    //	FBOS
    const numParticles = Config.numParticles
    const o = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
      mipmap: false
    }

    // this._fbo 			= new FboPingPong(numParticles, numParticles, o, 3);
    this._fbos = []
    let i = Config.numSets
    while (i--) {
      this._fbos.push(new FboPingPong(numParticles, numParticles, o, 3))
    }

    this._fbos.forEach(fbo => {
      fbo.read.getTexture(0).minFilter = GL.NEAREST
      fbo.read.getTexture(0).magFilter = GL.NEAREST

      fbo.write.getTexture(0).minFilter = GL.NEAREST
      fbo.write.getTexture(0).magFilter = GL.NEAREST
    })

    this._fboShadow = new alfrid.FrameBuffer(1024, 1024, { minFilter: GL.LINEAR, magFilter: GL.LINEAR })
    this._textureParticle = new ParticleTexture()

    const fboSize = 1024
    this._fboMask = new alfrid.FrameBuffer(fboSize, fboSize, { type: GL.FLOAT })
  }

  _initViews () {
    console.log('init views')

    //	helpers
    this._bCopy = new alfrid.BatchCopy()
    this._bAxis = new alfrid.BatchAxis()

    //	views
    this._vRender = new ViewRender()
    this._vRenderShadow = new ViewRenderShadow()
    this._vSim = new ViewSim()
    this._vMask = new ViewMask()

    this._fbos.forEach(fbo => {
      this._vSave = new ViewSave()
      fbo.read.bind()
      GL.clear(0, 0, 0, 0)
      this._vSave.render()
      fbo.read.unbind()
    })

    GL.setMatrices(this.camera)
  }

  updateFbo () {
    this._fbos.forEach(fbo => {
      fbo.write.bind()
      GL.clear(0, 0, 0, 1)
      this._vSim.render(
        fbo.read.getTexture(1),
        fbo.read.getTexture(0),
        fbo.read.getTexture(2))
      fbo.write.unbind()
      fbo.swap()
    })
  }

  _renderParticles () {
    const p = this._count / Config.skipCount
    this._fbos.forEach(fbo => {
      this._vRender.render(
        fbo.write.getTexture(0),
        fbo.read.getTexture(0),
        p,
        fbo.read.getTexture(2),
        this._shadowMatrix,
        this._fboShadow.getDepthTexture(),
        this.textureParticle
      )
    })
  }

  _renderShadowMap () {
    this._fboShadow.bind()
    GL.clear(0, 0, 0, 0)
    GL.setMatrices(this._cameraLight)
    const p = this._count / Config.skipCount

    this._fbos.forEach(fbo => {
      this._vRenderShadow.render(
        fbo.read.getTexture(0),
        fbo.read.getTexture(0),
        p,
        fbo.read.getTexture(2)
      )
    })

    this._fboShadow.unbind()
  }

  render () {
    this._count++
    if (this._count % Config.skipCount === 0) {
      this._count = 0
      this.updateFbo()
    }

    this._renderShadowMap()

    const r = Config.background
    GL.clear(r, r, r, 1)
    GL.setMatrices(this.camera)

    this._bAxis.draw()

    this._renderParticles()
    this._vMask.render()

    const s = 256
    GL.viewport(0, 0, s, s)
    this._bCopy.draw(this.textureParticle)
    GL.viewport(s, 0, s, s)
    this._bCopy.draw(this._fboShadow.depthTexture)
    // this._bCopy.draw(this._fboShadow.getTexture());
  }

  resize (w, h) {
    resize(w, h)
    this.camera.setAspectRatio(GL.aspectRatio)
  }

  get textureParticle () {
    return this._textureParticle.getTexture()
  }
}

export default SceneApp
