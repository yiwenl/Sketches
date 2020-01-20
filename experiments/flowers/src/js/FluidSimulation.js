// FluidSimulation.js
import alfrid, { GL, FboPingPong, TouchDetector } from 'alfrid'
import Assets from './Assets'
import Config from './Config'
import { map } from './utils'
import Draw from './utils/Draw'

import fsAdvect from 'shaders/advect.frag'
import fsDivergence from 'shaders/divergence.frag'
import fsClear from 'shaders/clear.frag'
import fsJacobi from 'shaders/jacobi.frag'
import fsGradientSub from 'shaders/gradientSubstract.frag'
import fsSplat from 'shaders/splat.frag'

const DEG = v => {
  return Math.floor(v * 180 / Math.PI)
}

class FluidSimulation {
  constructor (mCamera) {
    this.mouse = [0, 0, 0]
    this._camera = mCamera
    this._texelSize = [1 / Config.TEXTURE_WIDTH, 1 / Config.TEXTURE_HEIGHT]

    this._initTextures()
    this._initTouches()
    this._initShaders()
  }

  _initShaders () {
    const mesh = alfrid.Geom.bigTriangle()
    this.mesh = mesh
    const vs = alfrid.ShaderLibs.bigTriangleVert

    this._drawAdvect = new Draw()
      .useProgram(vs, fsAdvect)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform('uTimestep', 'float', 0.001)
      .uniform('uTexelSize', 'vec2', this._texelSize)

    this._drawDivergence = new Draw()
      .useProgram(vs, fsDivergence)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fboDivergence)
      .uniform('uTexelSize', 'vec2', this._texelSize)

    this._drawClear = new Draw()
      .useProgram(vs, fsClear)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform('uDissipation', 'float', Config.PRESSURE_DISSIPATION)

    this._drawJacobi = new Draw()
      .useProgram(vs, fsJacobi)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform('uTexelSize', 'vec2', this._texelSize)

    this._drawGradient = new Draw()
      .useProgram(vs, fsGradientSub)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform('uTexelSize', 'vec2', this._texelSize)

    this._shaderSplat = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsSplat)
    this._shaderSplat.bind()
    this._shaderSplat.uniform('texture', 'uniform1i', 1)
    this._shaderSplat.uniform('uTarget', 'uniform1i', 0)
    this._shaderSplat.uniform('uRatio', 'float', Config.TEXTURE_WIDTH / Config.TEXTURE_HEIGHT)
  }

  _initTextures () {
    this._texture = Assets.get('liquid')
    const MIPMAP = GL.LINEAR_MIPMAP_LINEAR

    this._texture.minFilter = MIPMAP
    this._texture.magFilter = GL.LINEAR
    this._texture.wrapS = this._texture.wrapT = GL.MIRRORED_REPEAT

    const type = GL.FLOAT

    const oSettings = {
      minFilter: MIPMAP,
      magFilter: GL.LINEAR,
      wrapS: GL.MIRRORED_REPEAT,
      wrapT: GL.MIRRORED_REPEAT,
      type
    }

    this._fboVelocity = new FboPingPong(Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, oSettings)
    this._fboDensity = new FboPingPong(Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, oSettings)
    this._fboPressure = new FboPingPong(Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, oSettings)
    this._fboDivergence = new alfrid.FrameBuffer(Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, oSettings)
  }

  _initTouches () {
    const { vec3 } = window
    this.hit = vec3.create()
    this.mesh = alfrid.Geom.sphere(Config.sphereSize, 12)
    this._detector = new TouchDetector(this.mesh, this._camera)
    this._detector.on('onHit', (e) => {
      vec3.copy(this.hit, e.detail.hit)

      const x = this.hit[0]
      const y = this.hit[1]
      const z = this.hit[2]

      const offset = -90
      let ay = DEG(Math.atan2(x, z)) + offset
      if (ay < 0) {
        ay += 360
      }
      const r = Math.sqrt(x * x + z * z)
      const ax = DEG(Math.atan2(y, r))

      const u = map(ay, 0, 360, 0, Config.TEXTURE_WIDTH)
      const v = map(ax, -90, 90, 0, Config.TEXTURE_HEIGHT)

      const speed = 500 * Config.fluidSpeed
      let dx, dy
      if (this._prevU === undefined) {
        dx = 0
        dy = 0
      } else {
        dx = (u - this._prevU) * speed
        dy = -(v - this._prevV) * speed
      }
      this._prevU = u
      this._prevV = v
      this.createSplat(u, v, dx, dy, 0.002 * Config.touchSize)
    })

    this._detector.on('onUp', (e) => {
      vec3.set(this.hit, 999, 999, 999)
    })
  }

  advect (target, textureX, dissipation) {
    this._drawAdvect
      .bindFrameBuffer(target)
      .uniformTexture('textureVel', this._fboVelocity.read.texture, 0)
      .uniformTexture('textureMap', textureX, 1)
      .uniform('uDissipation', 'float', dissipation)
      .draw()
  }

  createSplat (x, y, dx, dy, radius) {
    radius = radius || Config.SPLAT_RADIUS

    this._fboVelocity.write.bind()
    GL.clear(0, 0, 0, 1)

    this._shaderSplat.bind()
    this._shaderSplat.uniform('radius', 'float', radius)
    this._shaderSplat.uniform('aspectRatio', 'float', Config.TEXTURE_WIDTH / Config.TEXTURE_HEIGHT)
    this._shaderSplat.uniform('point', 'vec2', [x / Config.TEXTURE_WIDTH, y / Config.TEXTURE_HEIGHT])
    const speed = 1
    this._shaderSplat.uniform('color', 'vec3', [dx * speed, -dy * speed, 1])
    this._shaderSplat.uniform('uIsVelocity', 'float', 1.0)

    this._fboVelocity.read.texture.bind(0)
    this._texture.bind(1)
    GL.draw(this.mesh)
    this._fboVelocity.write.unbind()
    this._fboVelocity.swap()

    // let g = 0.0075;
    const g = 0.05
    this._fboDensity.write.bind()
    GL.clear(0, 0, 0, 1)
    this._shaderSplat.uniform('color', 'vec3', [g, g, g])
    this._shaderSplat.uniform('uIsVelocity', 'float', 0.0)
    this._fboDensity.read.texture.bind(0)
    GL.draw(this.mesh)
    this._fboDensity.write.unbind()
    this._fboDensity.swap()
  }

  update () {
    // this._fakeTouch()

    // advect - velocity
    this.advect(
      this._fboVelocity.write,
      this._fboVelocity.read.texture,
      Config.VELOCITY_DISSIPATION
    )
    this._fboVelocity.swap()

    // advect - density
    this.advect(
      this._fboDensity.write,
      this._fboDensity.read.texture,
      Config.DENSITY_DISSIPATION
    )
    this._fboDensity.swap()

    // divergence
    this._drawDivergence
      .uniformTexture('textureVel', this._fboVelocity.read.texture, 0)
      .draw()

    // clear
    this._drawClear
      .bindFrameBuffer(this._fboPressure.write)
      .uniformTexture('texturePressure', this._fboPressure.read.texture, 0)
      .draw()
    this._fboPressure.swap()

    // jacobi
    for (let i = 0; i < Config.PRESSURE_ITERATIONS; i++) {
      this._drawJacobi
        .bindFrameBuffer(this._fboPressure.write)
        .uniformTexture('texturePressure', this._fboPressure.read.texture, 0)
        .uniformTexture('textureDivergence', this._fboDivergence.texture, 1)
        .draw()

      this._fboPressure.swap()
    }

    // gradient sub
    this._drawGradient
      .bindFrameBuffer(this._fboVelocity.write)
      .uniformTexture('texturePressure', this._fboPressure.read.texture, 0)
      .uniformTexture('textureVel', this._fboVelocity.read.texture, 1)
      .draw()

    this._fboVelocity.swap()
  }

  get velocity () {
    return this._fboVelocity.read.texture
  }

  get density () {
    return this._fboDensity.read.texture
  }

  get divergence () {
    return this._fboDivergence.texture
  }

  get pressure () {
    return this._fboPressure.read.texture
  }

  get allTextures () {
    return [
      this.velocity,
      this.density,
      this.divergence,
      this.pressure
    ]
  }
}

export default FluidSimulation
