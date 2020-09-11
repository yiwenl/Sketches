import alfrid, { GL } from 'alfrid'
import Config from './Config'

// shaders
import fsRain from 'shaders/rain.frag'
import fsFlow from 'shaders/flow.frag'
import fsWaterHeight from 'shaders/waterheight.frag'

const MAX_STEPS = 10000

const controls = {
  Kc: 0.001,
  Kd: 0.0001,
  Ks: 0.0001,
  evadegree: 0.05,
  mtnsharp: 0.06,
  pipeAra: 0.00002,
  pipelen: 0.006,
  raindegree: 0.005,
  tesselations: 5,
  timestep: 0.001
}

class ErosionSimulation {
  constructor () {
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR
    }

    const { simulationSize: size } = Config

    // fbos
    this._fboTerrain = new alfrid.FboPingPong(size, size, oSettings)
    this._fboFlux = new alfrid.FboPingPong(size, size, oSettings)
    this._fboVel = new alfrid.FboPingPong(size, size, oSettings)
    this._fboSediment = new alfrid.FboPingPong(size, size, oSettings)
    this._fboTerrainNor = new alfrid.FrameBuffer(size, size, oSettings)

    // draw calls
    const getDrawCall = (fs) => {
      return new alfrid.Draw()
        .setMesh(alfrid.Geom.bigTriangle())
        .useProgram(alfrid.ShaderLibs.bigTriangleVert, fs)
        .setClearColor(0, 0, 0, 0)
    }

    this._drawRain = getDrawCall(fsRain)
    this._drawFlow = getDrawCall(fsFlow)
    this._drawWaterHeight = getDrawCall(fsWaterHeight)

    // state
    this._step = 0
    this._isStarting = false

    // helpers
    this._bCopy = new alfrid.BatchCopy()
  }

  reset (mTexture) {
    this._step = 0

    this._fboTerrain.read.bind()
    GL.clear(0, 0, 0, 0)
    this._bCopy.draw(mTexture)
    this._fboTerrain.read.unbind()
  }

  toggle () {
    if (this._isStarting) { this.stop() } else { this.start() }
  }

  start () {
    this._isStarting = true
  }

  stop () {
    this._isStarting = false
  }

  update () {
    if (!this._isStarting) { return }
    if (this._step++ > MAX_STEPS) {
      this._isStarting = false
      return
    }
    // console.log(' Step : ', this._step)

    // add rain
    this._drawRain
      .bindFrameBuffer(this._fboTerrain.write)
      .uniformTexture('texture', this._fboTerrain.read.texture, 0)
      .uniform('uRainDegree', 'float', controls.raindegree)
      .draw()

    this._fboTerrain.swap()

    // flux
    this._drawFlow
      .bindFrameBuffer(this._fboFlux.write)
      .uniformTexture('textureTerrain', this._fboTerrain.read.texture, 0)
      .uniformTexture('textureFlux', this._fboFlux.read.texture, 1)
      .uniform('uPipeLen', 'float', controls.pipelen)
      .uniform('uPipeArea', 'float', controls.pipeAra)
      .uniform('uTimestep', 'float', controls.timestep)
      .uniform('uSimRes', 'float', this._fboFlux.write.width)
      .draw()

    this._fboFlux.swap()

    this._drawWaterHeight
      .uniform('uPipeLen', 'float', controls.pipelen)
      .uniform('uPipeArea', 'float', controls.pipeAra)
      .uniform('uTimestep', 'float', controls.timestep)
      .uniform('uSimRes', 'float', this._fboFlux.write.width)
  }

  get texture () { return this._fboTerrain.read.texture }

  get step () {
    return this._step
  }
}

export default ErosionSimulation
