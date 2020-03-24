// SceneApp.js

import alfrid, { GL, FboPingPong } from 'alfrid'
import ViewSave from './ViewSave'
import ViewRender from './ViewRender'
import ViewRenderShadow from './ViewRenderShadow'
import ViewSim from './ViewSim'
import ViewFloor from './ViewFloor'
import Config from './Config'
import ParticleTexture from './ParticleTexture'
import DrawPerson from './DrawPerson'
import DrawFloatParticles from './DrawFloatParticles'

import FaceDetection from './FaceDetection'
import FaceMeshIndices from './FaceMeshIndices'
import { resize, biasMatrix } from './utils'

import vs from 'shaders/debugPoints.vert'
import fs from 'shaders/debugPoints.frag'

window.getAsset = function (id) {
  return assets.find((a) => a.id === id).file
}

let toggle = false

class SceneApp extends alfrid.Scene {
  constructor () {
    super()
    GL.enableAlphaBlending()

    this._count = 0
    this.camera.setPerspective(Math.PI / 2, GL.aspectRatio, 0.1, 100)
    this.orbitalControl.radius.setTo(15)
    this.orbitalControl.radius.value = 10
    this.orbitalControl.radius.limit(10, 10)
    this.orbitalControl.rx.value = 0.3
    this.orbitalControl.rx.limit(0.3, 0.3)

    const r = 0.3
    this.orbitalControl.ry.limit(-r, r)
    // this.orbitalControl.ry.value = 0.25
    this.orbitalControl.positionOffset = [0, -10, 0]
    console.log(this.orbitalControl)

    this.posLight = [0, 10, 8]
    this._cameraLight = new alfrid.CameraOrtho()
    let s = 10
    this._cameraLight.ortho(-s, s, s, -s, 1, 50)
    this._cameraLight.lookAt(this.posLight, [0, 0, 0])
    this._shadowMatrix = mat4.create()
    mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix)
    mat4.multiply(this._shadowMatrix, biasMatrix, this._shadowMatrix)

    // camera front

    const cameraFront = new alfrid.CameraOrtho()
    s = 7.5

    cameraFront.ortho(-s, s, s, -s, 1, 50)
    cameraFront.lookAt([0, 0, 8], [0, 0, 0])
    this.cameraFront = cameraFront
    this._frontMatrix = mat4.create()
    mat4.multiply(this._frontMatrix, cameraFront.projection, cameraFront.viewMatrix)
    mat4.multiply(this._frontMatrix, biasMatrix, this._frontMatrix)

    this._offsetModel = new alfrid.EaseNumber(0, 0.2)

    FaceDetection.init()
    FaceDetection.on('onFace', (vertices) => this._onFace(vertices))
  }

  _initTextures () {
    console.log('init textures')

    // FBOS
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
      this._fbos.push(new FboPingPong(numParticles, numParticles, o, 4))
    }

    this._fbos.forEach(fbo => {
      fbo.read.getTexture(0).minFilter = GL.NEAREST
      fbo.read.getTexture(0).magFilter = GL.NEAREST

      fbo.write.getTexture(0).minFilter = GL.NEAREST
      fbo.write.getTexture(0).magFilter = GL.NEAREST
    })

    const shadowMapScale = 2.0
    this._fboShadow = new alfrid.FrameBuffer(1024 * shadowMapScale, 1024 * shadowMapScale, { minFilter: GL.LINEAR, magFilter: GL.LINEAR })
    this._textureParticle = new ParticleTexture()

    const fboSize = 1024
    this._fboFront = new alfrid.FrameBuffer(fboSize, fboSize, o)

    console.log('Num particles : ', numParticles * numParticles * Config.numSets)
  }

  _initViews () {
    console.log('init views')

    // helpers
    this._bCopy = new alfrid.BatchCopy()
    this._bAxis = new alfrid.BatchAxis()
    this._vFloor = new ViewFloor()

    // views
    this._vRender = new ViewRender()
    this._vRenderShadow = new ViewRenderShadow()
    this._vSim = new ViewSim()

    this._drawPerson = new DrawPerson()
    this._drawFloatParticles = new DrawFloatParticles()

    this._fbos.forEach(fbo => {
      this._vSave = new ViewSave()
      fbo.read.bind()
      GL.clear(0, 0, 0, 0)
      this._vSave.render()
      fbo.read.unbind()
    })

    GL.setMatrices(this.camera)
  }

  _onFace (vertices) {
    // console.log('Gettign face', vertices.length)

    if (!this._drawPoints) {
      const indices = []
      for (let i = 0; i < vertices.length; i++) {
        indices.push(i)
      }

      const mesh = new alfrid.Mesh()
      mesh.bufferVertex(vertices)
      mesh.bufferIndex(FaceMeshIndices)

      this._drawPoints = new alfrid.Draw()
        .createMesh(GL.POINTS)
        .setMesh(mesh)
        .useProgram(vs, fs)
    } else {
      if (toggle) {
        this._drawPoints
          .bufferVertex(vertices)
      } else {
        this._drawPoints
          .bufferNormal(vertices)
      }
    }

    toggle = !toggle
    this._offsetModel.value = toggle ? 0 : 1
  }

  updateFbo () {
    GL.disable(GL.CULL_FACE)
    GL.setMatrices(this.cameraFront)
    this._fboFront.bind()
    GL.clear(0, 0, 0, 0)

    if (this._drawPoints) {
      this._drawPoints
        .uniform('uViewport', 'vec2', [GL.width, GL.height])
        .uniform('uOffset', 'float', this._offsetModel.value)
        .draw()
    }

    this._fboFront.unbind()
    GL.enable(GL.CULL_FACE)

    GL.setMatrices(this.camera)

    this._fbos.forEach(fbo => {
      fbo.write.bind()
      GL.clear(0, 0, 0, 1)
      this._vSim.render(
        fbo.read.getTexture(1),
        fbo.read.getTexture(0),
        fbo.read.getTexture(2),
        this._frontMatrix,
        this._fboFront.texture,
        fbo.read.getTexture(3)
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
        fbo.read.getTexture(3)
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
        fbo.read.getTexture(3)
      )
    })

    this._drawPerson.draw(this.posLight)
    this._drawFloatParticles.draw()

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

    this._renderParticles()

    this._drawPerson.draw(this.posLight)
    if (Config.showFloatingParticles) this._drawFloatParticles.draw()
    this._vFloor.render(this._shadowMatrix, this._fboShadow.getDepthTexture())

    const s = 300
    GL.viewport(0, 0, s, s)
    // this._bCopy.draw(this.textureParticle);
    // this._bCopy.draw(this._fbos[0].read.getTexture())
    // this._bCopy.draw(this._fboShadow.getTexture())
    // this._bCopy.draw(this._fboFront.texture)
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
