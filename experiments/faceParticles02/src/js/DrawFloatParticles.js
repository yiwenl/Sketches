import alfrid, { Draw, GL } from 'alfrid'

import { random } from 'randomutils'
import vs from 'shaders/floatParticle.vert'
import fs from 'shaders/floatParticle.frag'

class DrawFloatParticles extends Draw {
  constructor () {
    super()

    const num = 1000
    const positions = []
    const normals = []
    const uvs = []
    const indices = []

    const r = 10

    for (let i = 0; i < num; i++) {
      positions.push([random(-r, r), random(-r, r), random(-r, r)])
      normals.push([random(-0.2, 1), random(0.5, 1), random(-1, 1)])
      uvs.push([random(1), random(1)])
      indices.push(i)
    }

    const mesh = new alfrid.Mesh(GL.POINTS)
    mesh.bufferVertex(positions)
    mesh.bufferNormal(normals)
    mesh.bufferTexCoord(uvs)
    mesh.bufferIndex(indices)

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform('uRange', 'float', r)
  }

  draw () {
    this
      .uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
      .uniform('uViewport', 'vec2', [GL.width, GL.height])
    super.draw()
  }
}

export default DrawFloatParticles
