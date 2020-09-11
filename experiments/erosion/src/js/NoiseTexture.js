import alfrid from 'alfrid'

import fs from 'shaders/noise.frag'

class NoiseTexture extends alfrid.FrameBuffer {
  constructor (mSize = 1024, mSettings = {}) {
    super(mSize, mSize, mSettings)

    new alfrid.Draw()
      .setMesh(alfrid.Geom.bigTriangle())
      .useProgram(alfrid.ShaderLibs.bigTriangleVert, fs)
      .uniform('uSeed', 'float', Math.random())
      .bindFrameBuffer(this)
      .setClearColor(0, 0, 0, 1)
      .draw()
  }
}

export default NoiseTexture
