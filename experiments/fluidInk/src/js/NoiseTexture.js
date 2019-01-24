// NoiseTexture.js

import alfrid, { GL } from 'alfrid'
import Config from './Config'
import fs from 'shaders/noise.frag'

class NoiseTexture extends alfrid.View {
  constructor () {
    super(alfrid.ShaderLibs.bigTriangleVert, fs)
  }

  _init () {
    this.mesh = alfrid.Geom.bigTriangle()
    this.seed = Math.random() * 0xFF

    const { CUBE_MAP_SIZE } = Config
    this._fbo = new alfrid.FrameBuffer(CUBE_MAP_SIZE, CUBE_MAP_SIZE)
    this.render()
  }

  render () {
    this.shader.bind()
    this.shader.uniform('uSeed', 'float', this.seed)
    GL.draw(this.mesh)
  }

  get texture () { return this._fbo.getTexture() }
}

export default NoiseTexture
