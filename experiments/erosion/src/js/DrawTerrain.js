import alfrid, { GL } from 'alfrid'

import Config from './Config.js'
import vs from 'shaders/terrain.vert'
import fs from 'shaders/terrain.frag'

class DrawTerrain extends alfrid.Draw {
  constructor () {
    super()

    this.container = new alfrid.Object3D()

    const { planeSize } = Config
    const num = 100
    const numSlices = 10
    const posOffsets = []
    const size = planeSize / numSlices
    for (let i = 0; i < numSlices; i++) {
      for (let j = 0; j < numSlices; j++) {
        const x = -planeSize / 2 + i * size + size * 0.5
        const z = -planeSize / 2 + j * size + size * 0.5
        posOffsets.push([x, 0, z])
      }
    }

    const mesh = alfrid.Geom.plane(size, size, num, 'xz')
    mesh.bufferInstance(posOffsets, 'aPosOffset')

    this.setMesh(mesh)
      .useProgram(vs, fs)
  }

  draw () {
    GL.rotate(this.container.matrix)

    super.draw()
  }
}

export default DrawTerrain
