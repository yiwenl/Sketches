// SceneApp.js

import alfrid, { Scene, GL, FboPingPong } from 'alfrid'
import ViewSave from './ViewSave'
import ViewRender from './ViewRender'
import ViewRenderShadow from './ViewRenderShadow'
import ViewSim from './ViewSim'
import ViewFloor from './ViewFloor'
import Config from './Config'
import Assets from './Assets'
import ParticleTexture from './ParticleTexture'
import { resize } from './utils'

import fs from 'shaders/post.frag'

window.getAsset = function (id) {
  return assets.find((a) => a.id === id).file
}

class SceneApp extends alfrid.Scene {
  constructor () {
    super()
    GL.enableAlphaBlending()

    this._count = 0
    this.camera.setPerspective(Math.PI / 2, GL.aspectRatio, 0.1, 100)
    this.orbitalControl.radius.value = 10
    // this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3

    this._cameraLight = new alfrid.CameraOrtho()
    const s = 10
    this._cameraLight.ortho(-s, s, s, -s, 1, 20)
    // this._cameraLight.lookAt([0, 10, 0.1], [0, 0, 0], [0, 1, 0]);
    this._cameraLight.lookAt([0, 4, 4], [0, 0, 0])

    this._biasMatrix = mat4.fromValues(
      0.5, 0.0, 0.0, 0.0,
      0.0, 0.5, 0.0, 0.0,
      0.0, 0.0, 0.5, 0.0,
      0.5, 0.5, 0.5, 1.0
    )
    this._shadowMatrix = mat4.create()
    mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix)
    mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix)
  }

  _initTextures () {
    console.log('init textures')
    this._textureSource = Assets.get(Config.source)
    this._ratioSource = this._textureSource.width / this._textureSource.height

    //	FBOS
    const numParticles = Config.numParticles
    const o = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
      mipmap: false
    }

    this._fbos = []
    let i = Config.numSets
    while (i--) {
      this._fbos.push(new FboPingPong(numParticles, numParticles, o, 5))
    }

    this._fbos.forEach(fbo => {
      fbo.read.getTexture(0).minFilter = GL.NEAREST
      fbo.read.getTexture(0).magFilter = GL.NEAREST

      fbo.write.getTexture(0).minFilter = GL.NEAREST
      fbo.write.getTexture(0).magFilter = GL.NEAREST
    })

    this._fboShadow = new alfrid.FrameBuffer(1024, 1024, { minFilter: GL.LINEAR, magFilter: GL.LINEAR })
    this._textureParticle = new ParticleTexture()

    // console.log('Num particles : ', numParticles * numParticles * Config.numSets)

    const fboSize = 2048
    this._fboRender = new alfrid.FrameBuffer(fboSize, fboSize)
  }

  _initViews () {
    console.log('init views')

    //	helpers
    this._bCopy = new alfrid.BatchCopy()
    this._vFloor = new ViewFloor()

    //	views
    this._vRender = new ViewRender()
    this._vRenderShadow = new ViewRenderShadow()
    this._vSim = new ViewSim()

    this._fbos.forEach(fbo => {
      this._vSave = new ViewSave(this._textureSource.width / this._textureSource.height)
      fbo.read.bind()
      GL.clear(0, 0, 0, 0)
      this._vSave.render()
      fbo.read.unbind()
    })

    GL.setMatrices(this.camera)

    this._drawPost = new alfrid.Draw()
      .setMesh(alfrid.Geom.bigTriangle())
      .useProgram(alfrid.ShaderLibs.bigTriangleVert, fs)
  }

  updateFbo () {
    this._fbos.forEach(fbo => {
      fbo.write.bind()
      GL.clear(0, 0, 0, 1)
      this._vSim.render(
        fbo.read.getTexture(1),
        fbo.read.getTexture(0),
        fbo.read.getTexture(2),
        fbo.read.getTexture(3),
        fbo.read.getTexture(4)
      )
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
        this.textureParticle,
        fbo.read.getTexture(4)
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
        fbo.read.getTexture(2),
        fbo.read.getTexture(4)
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

    GL.clear(0, 0, 0, 1)
    GL.setMatrices(this.camera)

    this._fboRender.bind()
    GL.clear(0, 0, 0, 1)

    this._renderParticles()
    this._fboRender.unbind()

    this._drawPost
      .uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
      .uniformTexture('texture', this._fboRender.texture, 0)
      .draw()

    // this._bCopy.draw(this._fboRender.texture)
    // this._vFloor.render(this._shadowMatrix, this._fboShadow.getDepthTexture())

    /*
    const s = 256 / 2
    GL.viewport(0, 0, s, s / this._ratioSource)
    this._bCopy.draw(this._textureSource)
    GL.viewport(s, 0, s, s)
    this._bCopy.draw(this._fbos[0].read.getTexture(4))

    */
    // this._bCopy.draw(this.textureParticle);
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
