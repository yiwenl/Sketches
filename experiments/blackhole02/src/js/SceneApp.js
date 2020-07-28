// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid'
import Assets from './Assets'
import Config from './Config'
import { resize, biasMatrix } from './utils'
import { random } from 'randomUtils'
import debugCamera from './utils/debugCamera'
import getParticleTexture from './utils/getParticleTexture'

import vsSave from 'shaders/save.vert'
import fsSave from 'shaders/save.frag'

import vsPass from 'shaders/pass.vert'
import fsSim from 'shaders/sim.frag'

import vsRender from 'shaders/render.vert'
import fsRender from 'shaders/render.frag'
import fsDepth from 'shaders/depth.frag'

class SceneApp extends Scene {
  constructor () {
    super()
    GL.enableAlphaBlending()
    this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3
    this.orbitalControl.radius.value = 10
    this._seed = Math.random() * 0xFF

    this._lightPos = [0, 4, 1]
    this._cameraLight = new alfrid.CameraOrtho()
    const s = 3.5
    this._cameraLight.ortho(-s, s, s, -s, 0.5, 7.5)
    this._cameraLight.lookAt(this._lightPos, [0, 0, 0])

    this._mtxShadow = mat4.create()
    mat4.mul(this._mtxShadow, this._cameraLight.projection, this._cameraLight.matrix)
    mat4.mul(this._mtxShadow, biasMatrix, this._mtxShadow)

    this._textureParticle = getParticleTexture(this._lightPos)

    const { numHoles } = Config
    this._holes = []
    for (let i = 0; i < numHoles; i++) {
      const axis = [random(-1, 1), random(-1, 1), random(-1, 1)]
      const a = random(Math.PI * 2)
      const v = [random(0.5, 1.5), 0, 0]
      const speed = random(-1, 1)
      this._holes.push({
        axis,
        a,
        v,
        speed
      })
    }

    this.resize()
  }

  _initTextures () {
    const { numSets, numParticles } = Config
    console.log('init textures', numSets, numParticles)

    this._sets = []
    const o = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST
    }

    for (let i = 0; i < numSets; i++) {
      const fbo = new alfrid.FboPingPong(numParticles, numParticles, o, 5)
      this._sets.push(fbo)
    }

    const shadowMapSize = 2048
    this._fboDepth = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize)
  }

  _initViews () {
    const { numSets, numParticles } = Config
    console.log('init views')

    this._bCopy = new alfrid.BatchCopy()
    this._bAxis = new alfrid.BatchAxis()
    this._bDots = new alfrid.BatchDotsPlane()
    this._bBall = new alfrid.BatchBall()

    const m = mat4.create()

    const getRandomPos = () => {
      const r = 3.0
      const v = vec3.fromValues(r, 0, 0)
      mat4.identity(m, m)
      mat4.rotateY(m, m, random(Math.PI * 2))
      mat4.rotateZ(m, m, random(Math.PI * 2))
      vec3.transformMat4(v, v, m)
      return v
    }

    const meshSave = (() => {
      const mesh = new alfrid.Mesh(GL.POINTS)
      const positions = []
      const uvs = []
      const normals = []
      const indices = []
      const data = []
      let index = 0

      for (let i = 0; i < numParticles; i++) {
        for (let j = 0; j < numParticles; j++) {
          positions.push(getRandomPos())
          normals.push([random(1), random(1), random(1)])
          data.push([random(1), random(1), random(1)])
          uvs.push([i / numParticles * 2 - 1, j / numParticles * 2 - 1])
          indices.push(index)
          index++
        }
      }

      mesh.bufferVertex(positions)
        .bufferNormal(normals)
        .bufferData(data, 'aData')
        .bufferTexCoord(uvs)
        .bufferIndex(indices)

      return mesh
    })()

    this._sets.forEach(fbo => {
      new alfrid.Draw()
        .setMesh(meshSave)
        .useProgram(vsSave, fsSave)
        .setClearColor(0, 0, 0, 1)
        .bindFrameBuffer(fbo.read)
        .draw()
        .bindFrameBuffer(fbo.write)
        .draw()
    })

    const meshRender = (() => {
      const mesh = new alfrid.Mesh(GL.POINTS)
      const positions = []
      const indices = []
      let index = 0

      for (let i = 0; i < numParticles; i++) {
        for (let j = 0; j < numParticles; j++) {
          positions.push([i / numParticles, j / numParticles, 0])
          indices.push(index)
          index++
        }
      }

      mesh.bufferVertex(positions)
        .bufferIndex(indices)

      return mesh
    })()

    this._drawRender = new alfrid.Draw()
      .setMesh(meshRender)
      .useProgram(vsRender, fsRender)

    this._drawDepth = new alfrid.Draw()
      .setMesh(meshRender)
      .useProgram(vsRender, fsDepth)

    const _fsSim = fsSim.replace('${numHoles}', Config.numHoles)
    this._drawSim = new alfrid.Draw()
      .setMesh(alfrid.Geom.bigTriangle())
      .useProgram(vsPass, _fsSim)
      .setClearColor(0, 0, 0, 1)
  }

  update () {
    if (Config.pause) { return }

    const holesUniform = []
    const q = quat.create()
    let p
    this._holes.forEach(({ a, axis, speed, v }) => {
      const theta = a + alfrid.Scheduler.deltaTime * speed * 0.5
      const r = 3
      p = [Math.cos(theta) * r, 0.0, Math.sin(theta) * r]
      quat.setAxisAngle(q, [0, 0, 1], a)
      vec3.transformQuat(p, p, q)
      holesUniform.push(p[0], p[1], p[2])
    })

    // console.log(holesUniform)

    this._sets.forEach(fbo => {
      this._drawSim
        .bindFrameBuffer(fbo.write)
        .uniformTexture('texturePos', fbo.read.getTexture(0), 0)
        .uniformTexture('textureVel', fbo.read.getTexture(1), 1)
        .uniformTexture('textureExtra', fbo.read.getTexture(2), 2)
        .uniformTexture('textureData', fbo.read.getTexture(3), 3)
        .uniformTexture('texturePosOrg', fbo.read.getTexture(4), 4)
        .uniform('uTime', 'float', alfrid.Scheduler.deltaTime + this._seed)
        .uniform('uHoles', 'vec3', holesUniform)
        .draw()

      fbo.swap()
    })

    GL.setMatrices(this._cameraLight)
    this._fboDepth.bind()
    GL.clear(1, 0, 0, 1)
    this._sets.forEach(fbo => {
      this._drawDepth
        .uniformTexture('texturePos', fbo.read.getTexture(0), 0)
        .uniformTexture('textureExtra', fbo.read.getTexture(2), 1)
        .uniform('uViewport', 'vec2', [GL.width, GL.height])
        .uniform('uShadowMatrix', 'mat4', this._mtxShadow)
        .draw()
    })
    this._fboDepth.unbind()
  }

  render () {
    GL.clear(0, 0, 0, 1)
    GL.setMatrices(this.camera)

    // this._bAxis.draw()
    // this._bDots.draw()

    this._sets.forEach(fbo => {
      this._drawRender
        .uniformTexture('texturePos', fbo.read.getTexture(0), 0)
        .uniformTexture('textureExtra', fbo.read.getTexture(2), 1)
        .uniformTexture('textureDepth', this._fboDepth.depthTexture, 2)
        .uniformTexture('textureParticle', this._textureParticle, 3)
        .uniformTexture('textureData', fbo.read.getTexture(3), 4)
        .uniform('uViewport', 'vec2', [GL.width, GL.height])
        .uniform('uShadowMatrix', 'mat4', this._mtxShadow)
        .uniform('uUseTextureOffset', 'float', Config.useTextureOffset ? 1.0 : 0.0)
        .draw()
    })

    // debugCamera(this._cameraLight)

    const s = 0.5
    const q = quat.create()
    let p
    this._holes.forEach(({ a, axis, speed, v }) => {
      const theta = a + alfrid.Scheduler.deltaTime * speed * 0.5
      const r = 3
      p = [Math.cos(theta) * r, 0.0, Math.sin(theta) * r]
      quat.setAxisAngle(q, [0, 0, 1], a)
      vec3.transformQuat(p, p, q)
      // this._bBall.draw(p, [s, s, s], [1, 0, 0], 0.2)
    })

    //  debug
    // s = Math.min(300, GL.width / 4)
    // const fbo = this._sets[0].read
    // GL.viewport(0, 0, s, s)
    // this._bCopy.draw(fbo.getTexture(3))

    // GL.viewport(s, 0, s, s)
    // this._bCopy.draw(fbo.getTexture(2))

    // GL.viewport(s * 2, 0, s, s)
    // this._bCopy.draw(this._fboDepth.depthTexture)

    // GL.viewport(s * 3, 0, s, s)
    // this._bCopy.draw(this._textureParticle)
  }

  resize (w, h) {
    resize(w, h)
    this.camera.setAspectRatio(GL.aspectRatio)
  }
}

export default SceneApp
