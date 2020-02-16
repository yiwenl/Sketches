// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import Assets from './Assets'
import Config from './Config'
import ViewLetters from './ViewLetters'
import DrawCubes from './DrawCubes'
import { resize, biasMatrix } from './utils'

import vs from 'shaders/position.vert'
import fs from 'shaders/position.frag'

class SceneApp extends Scene {
  constructor () {
    super()
    // GL.enableAlphaBlending()
    GL.enableAdditiveBlending()
    // this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3
    // this.orbitalControl.rx.value = -0.3
    let r = 0.4
    this.orbitalControl.rx.limit(-r, r)
    r = 0.75
    this.orbitalControl.ry.limit(-r, r)
    this.orbitalControl.radius.value = 5
    this.orbitalControl.radius.limit(2, 6)
    this.camera.setPerspective(75 * Math.PI / 180, GL.aspectRatio, 0.1, 20)

    this.cameraFront = new alfrid.CameraPerspective()
    this.cameraFront.setPerspective(90 * Math.PI / 180, GL.aspectRatio, 0.1, 100)
    this.cameraFront.lookAt([0, 0, 10], [0, 0, 0])

    this.mtx = mat4.create()
    this.mtxIdentity = mat4.create()

    this._shadowMatrix = mat4.create()
    mat4.multiply(this._shadowMatrix, this.cameraFront.projection, this.cameraFront.viewMatrix)
    mat4.multiply(this._shadowMatrix, biasMatrix, this._shadowMatrix)

    this._index = 0
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 32) {
        console.log('here')
        this._index++
        if (this._index >= 3) {
          this._index = 0
        }
      }
    })

    this.resize()
  }

  _initTextures () {
    console.log('init textures')
    const fboSize = 1024
    this._fbo = new alfrid.FrameBuffer(fboSize, fboSize, { type: GL.FLOAT })
  }

  _initViews () {
    console.log('init views')

    this._bCopy = new alfrid.BatchCopy()
    this._bAxis = new alfrid.BatchAxis()
    this._bDots = new alfrid.BatchDotsPlane()
    this._bBall = new alfrid.BatchBall()

    this._vLetters = new ViewLetters()

    let s = 1
    const meshCube = alfrid.Geom.cube(s, s, s)
    this._drawCubes = new DrawCubes(meshCube)
    // s = 0.75
    const meshSphere = alfrid.Geom.sphere(s / 2, 24)
    this._drawSphere = new DrawCubes(meshSphere)

    this._drawHead = new alfrid.Draw()
      .setMesh(Assets.get('model'))
      .useProgram(vs, fs)

    s = 5
    this._drawBox = new alfrid.Draw()
      .setMesh(alfrid.Geom.cube(s, s, s))
      // .setMesh(alfrid.Geom.sphere(3.5, 24))
      .useProgram(vs, fs)
  }

  update () {
    mat4.identity(this.mtx)
    mat4.rotateY(this.mtx, this.mtx, alfrid.Scheduler.deltaTime * 0.5)
    GL.enableAlphaBlending()
    GL.enable(GL.DEPTH_TEST)
    this._fbo.bind()
    GL.clear(0, 0, 0, 0)
    GL.setMatrices(this.cameraFront)
    GL.rotate(this.mtx)

    if (this._index === 0) {
      this._drawHead.draw()
    } else if (this._index === 1) {
      this._drawCubes
        .uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
        .draw()
    } else {
      this._drawSphere
        .uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
        .draw()
    }

    GL.cullFace(GL.FRONT)
    GL.rotate(this.mtxIdentity)
    this._drawBox.draw()
    GL.cullFace(GL.BACK)
    this._fbo.unbind()
    GL.enableAdditiveBlending()
  }

  render () {
    const g = Config.isInvert ? 1.0 : 0.0
    GL.clear(g, g, g, 1)

    GL.disable(GL.DEPTH_TEST)
    GL.setMatrices(this.camera)
    this._vLetters.render(this._fbo.texture, this._shadowMatrix)

    // const s = 500
    // GL.viewport(0, 0, s, s / GL.aspectRatio)
    // this._bCopy.draw(this._fbo.texture)
    // GL.enable(GL.DEPTH_TEST)
  }

  resize (w, h) {
    // resize(w, h)
    const ratio = 1
    resize(window.innerWidth * ratio, window.innerHeight * ratio)
    // resize(1080 * ratio, 1350 * ratio)
    // resize(1350 * ratio, 1080 * ratio)
    this.camera.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
