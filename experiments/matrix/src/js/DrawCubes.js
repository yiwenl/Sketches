import { Draw } from 'alfrid'

import { random } from 'randomutils'

import vs from 'shaders/cubes.vert'
import fs from 'shaders/position.frag'

class DrawCubes extends Draw {
  constructor (mesh) {
    super()
    const numCubes = 20

    // const mesh = alfrid.Geom.cube(s, s, s)
    // const mesh = alfrid.Geom.sphere(s / 2, 24)
    const posOffsets = []
    const axis = []
    const extra = []
    const range = 1.25

    for (let i = 0; i < numCubes; i++) {
      posOffsets.push([random(-range, range), random(-range, range), random(-range, range)])
      axis.push([random(-1, 1), random(-1, 1), random(-1, 1)])
      extra.push([random(0.25, 1), random(1), random(1)])
    }

    mesh.bufferInstance(posOffsets, 'aPosOffset')
    mesh.bufferInstance(axis, 'aAxis')
    mesh.bufferInstance(extra, 'aExtra')

    this.setMesh(mesh)
      .useProgram(vs, fs)
  }
}

export default DrawCubes
