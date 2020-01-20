import alfrid, { GL } from 'alfrid'

import { random } from 'randomutils'
import vs from 'shaders/wires.vert'
import fs from 'shaders/wires.frag'

class ViewWires extends alfrid.View {
  constructor () {
    super(vs, fs)
  }

  _init () {
    const num = 1
    const numSides = 4
    const positions = []
    const uvs = []
    const indices = []
    let count = 0

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < numSides; j++) {
        positions.push([i, j, 0])
        positions.push([i + 1, j, 0])
        positions.push([i + 1, j + 1, 0])
        positions.push([i, j + 1, 0])

        uvs.push([i / num, j / numSides])
        uvs.push([(i + 1) / num, j / numSides])
        uvs.push([(i + 1) / num, (j + 1) / numSides])
        uvs.push([i / num, (j + 1) / numSides])

        indices.push(count * 4 + 0)
        indices.push(count * 4 + 1)
        indices.push(count * 4 + 2)
        indices.push(count * 4 + 0)
        indices.push(count * 4 + 2)
        indices.push(count * 4 + 3)

        count++
      }
    }

    this.mesh = new alfrid.Mesh()
    this.mesh.bufferVertex(positions)
    this.mesh.bufferTexCoord(uvs)
    this.mesh.bufferIndex(indices)

    const numWires = 1000
    const posStart = []
    const posEnd = []
    const extra = []
    let i = numWires

    const getPos = (x, r) => {
      const _r = Math.sqrt(Math.random()) * r
      const a = random(Math.PI * 2)
      return [x, Math.cos(a) * _r, Math.sin(a) * _r]
    }

    const r = 2
    while (i--) {
      posStart.push(getPos(-random(2, 2.5), 1))
      posEnd.push(getPos(random(2, 2.5), 2))
      extra.push([random(0.5, 1), random(1), random(1)])
    }

    this.mesh.bufferInstance(posStart, 'aPosStart')
    this.mesh.bufferInstance(posEnd, 'aPosEnd')
    this.mesh.bufferInstance(extra, 'aExtra')
  }

  render () {
    this.shader.bind()
    this.shader.uniform('uLineWidth', 'float', 0.002)
    GL.draw(this.mesh)
  }
}

export default ViewWires
