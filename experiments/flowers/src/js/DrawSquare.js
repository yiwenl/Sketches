import alfrid from 'alfrid'

import Assets from './Assets'
import Config from './Config'

import vs from 'shaders/square.vert'
import fs from 'shaders/square.frag'

const BOARD_SIZE = 0.1

class DrawSquare extends alfrid.Draw {
  constructor () {
    super()

    const { PLANE_SIZE } = Config
    const num = PLANE_SIZE / BOARD_SIZE / 2
    const start = -num / 2 * BOARD_SIZE * 2 + BOARD_SIZE
    const s = BOARD_SIZE * 2

    const posOffsets = []
    const extras = []

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        const x = start + i * BOARD_SIZE * 2
        const y = start + j * BOARD_SIZE * 2
        const u = i / num
        const v = j / num

        posOffsets.push([x, y, u, v])
        extras.push([Math.random(), Math.random()])
      }
    }

    this.setMesh(alfrid.Geom.plane(s, s, 1))
      .useProgram(vs, fs)
      .bufferInstance(posOffsets, 'aPosOffset')
      .uniformTexture('texture', Assets.get('chars'), 0)
  }
}

export default DrawSquare
