import alfrid from 'alfrid'

import Assets from './Assets'
import Config from './Config'
import vs from 'shaders/flip.vert'
import fs from 'shaders/flip.frag'
const BOARD_SIZE = 0.1

class DrawFlip extends alfrid.Draw {
  constructor () {
    super()

    this.z = 0
    const { PLANE_SIZE } = Config
    const num = PLANE_SIZE / BOARD_SIZE / 2
    const start = -num / 2 * BOARD_SIZE * 2 + BOARD_SIZE
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

    const s = BOARD_SIZE * 0.995
    const positions = []
    const uvs = []
    const indices = []
    const z = 0.001
    let count = 0

    // front
    positions.push([-s, s, z])
    positions.push([s, s, z])
    positions.push([s, 0, z])
    positions.push([-s, 0, z])

    uvs.push([0, 0])
    uvs.push([1, 0])
    uvs.push([1, 0.5])
    uvs.push([0, 0.5])

    indices.push(count * 4 + 0)
    indices.push(count * 4 + 1)
    indices.push(count * 4 + 2)
    indices.push(count * 4 + 0)
    indices.push(count * 4 + 2)
    indices.push(count * 4 + 3)

    count++

    // back
    positions.push([-s, 0, 0])
    positions.push([s, 0, 0])
    positions.push([s, s, 0])
    positions.push([-s, s, 0])

    uvs.push([0, 0.5])
    uvs.push([1, 0.5])
    uvs.push([1, 1])
    uvs.push([0, 1])

    indices.push(count * 4 + 0)
    indices.push(count * 4 + 1)
    indices.push(count * 4 + 2)
    indices.push(count * 4 + 0)
    indices.push(count * 4 + 2)
    indices.push(count * 4 + 3)

    count++

    this._offset = new alfrid.EaseNumber(0)
    // this._offset = new alfrid.TweenNumber(0, 'linear', 0.01)

    this.createMesh()
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices)
      .bufferInstance(posOffsets, 'aPosOffset')
      .useProgram(vs, fs)
      .uniformTexture('texture', Assets.get('chars'), 0)
  }

  draw () {
    this
      .uniform('uOffset', 'float', this._offset.value)
      .uniform('uZOffset', 'float', this.z)
    super.draw()
  }

  open () {
    this._offset.value = 0.5
  }

  close () {
    this._offset.value = 1
  }

  reset (isClosed = false) {
    this._offset.setTo(isClosed ? 1 : 0)
  }
}

export default DrawFlip
